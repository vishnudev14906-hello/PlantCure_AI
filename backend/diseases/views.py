import logging
from django.db.models import Q
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .models import Disease, ScanHistory, PlantTaxonomy, PlantPartDiseaseMapping, PredictionAuditLog
from .serializers import DiseaseSerializer, ScanHistorySerializer
from ml_engine.predictor import predict_plant_disease, predict_leaf

logger = logging.getLogger(__name__)

class DiseaseListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        crop = request.query_params.get('crop')
        plant_part = request.query_params.get('plant_part')
        search = request.query_params.get('search')
        severity = request.query_params.get('severity')

        queryset = Disease.objects.all()

        if crop:
            queryset = queryset.filter(crop__iexact=crop)
        if plant_part:
            queryset = queryset.filter(plant_part__iexact=plant_part)
        if severity:
            queryset = queryset.filter(severity_level__iexact=severity)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(crop__icontains=search) |
                Q(symptoms__icontains=search) |
                Q(description__icontains=search)
            )

        serializer = DiseaseSerializer(queryset, many=True, context={'request': request})
        
        # Unique crops and plant parts for filtering tabs
        crops = sorted(list(set(Disease.objects.values_list('crop', flat=True))))
        plant_parts = sorted(list(set(Disease.objects.values_list('plant_part', flat=True))))

        return Response({
            'count': queryset.count(),
            'crops': crops,
            'plant_parts': plant_parts,
            'results': serializer.data
        }, status=status.HTTP_200_OK)


class DiseaseDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            disease = Disease.objects.get(pk=pk)
            serializer = DiseaseSerializer(disease, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Disease.DoesNotExist:
            return Response({'detail': 'Disease not found.'}, status=status.HTTP_404_NOT_FOUND)


class PredictDiseaseView(APIView):
    """
    Accepts an uploaded plant leaf image, runs MobileNetV2 inference,
    cross-references the disease database, and returns the diagnosis with treatments.
    If the user is logged in, automatically records this scan into ScanHistory.
    """
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        image_file = request.FILES.get('image')
        if not image_file:
            return Response(
                {'detail': 'No leaf image provided. Please upload an image file (JPG, PNG, WEBP).'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate file format
        allowed_extensions = ['.jpg', '.jpeg', '.png', '.webp']
        ext = '.' + image_file.name.split('.')[-1].lower() if '.' in image_file.name else ''
        if ext not in allowed_extensions:
            return Response(
                {'detail': f'Unsupported image format "{ext}". Please upload a JPG, PNG, or WEBP image.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Maximum size: 15MB and minimum size: > 0 bytes
        if image_file.size == 0:
            return Response(
                {'detail': 'The uploaded image file is empty (0 bytes). Please select a valid photo.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if image_file.size > 15 * 1024 * 1024:
            return Response(
                {'detail': 'Image file too large. Maximum allowed size is 15MB.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            specified_crop = request.data.get('crop')
            specified_part = request.data.get('plant_part')
            gemini_api_key = request.headers.get('X-Gemini-API-Key') or request.data.get('gemini_api_key')
            # Run Multimodal / Two-Stage ML Prediction Pipeline
            prediction = predict_plant_disease(
                image_file,
                specified_crop=specified_crop,
                specified_part=specified_part,
                gemini_api_key=gemini_api_key
            )
        except Exception as e:
            logger.exception("Error during plant disease prediction:")
            return Response(
                {'detail': f'Failed to process plant image: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Check if AI service was temporarily unavailable or rate-limited
        if prediction.get('error_code') == 'AI_SERVICE_UNAVAILABLE':
            return Response({
                'is_valid_plant_image': False,
                'is_valid_plant': True,
                'error_code': 'AI_SERVICE_UNAVAILABLE',
                'detail': prediction.get('detail', 'AI analysis service temporarily busy. Please try again in a few moments.'),
                'tamil_detail': prediction.get('tamil_detail', 'செயற்கை நுண்ணறிவு சேவை தற்காலிகமாக கிடைக்கவில்லை. சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.'),
                'reason': prediction.get('reason', 'AI service rate limit or temporary timeout.')
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        # STAGE 1 VALIDATION CHECK: If image is NOT a valid plant part
        if not prediction.get('is_valid_plant_image', True):
            scan_id = None
            # If user is authenticated, record scan attempt as invalid in ScanHistory
            if request.user and request.user.is_authenticated:
                try:
                    image_file.seek(0)
                    scan_record = ScanHistory.objects.create(
                        user=request.user,
                        image=image_file,
                        disease=None,
                        predicted_disease_name='Invalid Image',
                        crop='Unknown',
                        detected_plant_part='unknown',
                        is_valid_plant_image=False,
                        confidence=prediction.get('confidence', 0.0),
                        is_healthy=False,
                        notes=request.data.get('notes', 'Stage 1 validation rejected non-plant image')
                    )
                    scan_id = scan_record.id
                except Exception as ex:
                    logger.warning(f"Could not record invalid scan in history: {ex}")

            try:
                PredictionAuditLog.objects.create(
                    user=request.user if request.user and request.user.is_authenticated else None,
                    input_image_name=getattr(image_file, 'name', '') or 'unknown',
                    detected_plant_part='unknown',
                    part_confidence_raw=float(prediction.get('part_confidence_raw', 0.0) or 0.0),
                    part_confidence_calibrated=0.0,
                    predicted_species='Unknown',
                    species_confidence_raw=0.0,
                    species_confidence_calibrated=0.0,
                    predicted_disease='Invalid Image / Non-Plant',
                    disease_confidence_raw=0.0,
                    disease_confidence_calibrated=0.0,
                    final_confidence=0.0,
                    calibration_method='stage1_rejection',
                    taxonomy_check_passed=False,
                    correction_applied=True,
                    correction_reason=prediction.get('reason', 'Image does not contain biological plant foliage, stem, or root features.')
                )
            except Exception as audit_err:
                logger.warning(f"Could not record invalid scan in audit log: {audit_err}")

            return Response({
                'scan_id': scan_id,
                'is_valid_plant_image': False,
                'is_valid_plant': False,  # Backward compatibility
                'is_valid_leaf': False,
                'detected_plant_part': 'unknown',
                'plant_part': 'unknown',
                'error_code': prediction.get('error_code', 'NO_PLANT_PART_DETECTED'),
                'detail': prediction.get('detail', "This doesn't look like a plant part. Please upload a clear photo of a plant leaf, stem, or root."),
                'tamil_detail': prediction.get('tamil_detail', "இது தாவரத்தின் பகுதியாகத் தெரியவில்லை. தயவுசெய்து தாவர இலை, தண்டு அல்லது வேரின் தெளிவான புகைப்படத்தை பதிவேற்றவும்."),
                'reason': prediction.get('reason', 'Image does not contain biological plant foliage, stem, or root features.')
            }, status=status.HTTP_400_BAD_REQUEST)

        disease_name = prediction['disease']
        crop_name = prediction['crop']
        detected_part = prediction.get('detected_plant_part', 'leaf')
        is_healthy = prediction['is_healthy']
        confidence = prediction['confidence']

        # Step 4: Run taxonomy consistency check (species vs plant part vs category)
        from ml_engine.predictor import BOTANICAL_TAXONOMY, validate_taxonomy_consistency
        from .models import PlantTaxonomy

        is_tax_consistent, tax_reason, tax_category = validate_taxonomy_consistency(
            crop_name,
            detected_part
        )

        # Step 5 & 6: Confidence thresholding (>= 75.0%) and taxonomy sanity check
        is_high_confidence = confidence >= 75.0
        should_show_exact = is_high_confidence and is_tax_consistent and crop_name not in ["General Plant", "Plant", "Auto"]

        general_fallback_display = None
        general_fallback_desc = None

        if not should_show_exact:
            # Step 6: Gracefully fall back to descriptive general category result
            if detected_part == "root":
                if tax_category == "tree" or "Tree" in crop_name or crop_name == "Woody Tree":
                    crop_name = "Woody Tree"
                    general_fallback_display = "Healthy Tree Root System" if is_healthy else "Tree root — general analysis"
                    general_fallback_desc = "Botanical General Analysis: This appears to be the root of a tree. The root structure exhibits lignified bark and subterranean woody architecture. Exact tree species could not be determined with high confidence."
                else:
                    crop_name = "General Plant"
                    general_fallback_display = "This appears to be the root of a plant"
                    general_fallback_desc = "Botanical General Analysis: This appears to be the root system of a plant. Exact species could not be determined with high confidence."
            elif detected_part == "flower":
                if tax_category == "herb":
                    crop_name = "Herbaceous Plant"
                    general_fallback_display = "This appears to be a flower of a herbaceous plant"
                    general_fallback_desc = "Botanical General Analysis: This appears to be a flower of a herbaceous plant. Floral anatomy is intact, but exact species could not be determined with high confidence."
                else:
                    crop_name = "Flowering Shrub"
                    general_fallback_display = "Flower of a flowering shrub — general analysis"
                    general_fallback_desc = "Botanical General Analysis: This appears to be a flower of a flowering shrub. Exact species could not be determined with high confidence."
            elif detected_part == "leaf":
                if tax_category == "tree" or "Tree" in crop_name:
                    crop_name = "Woody Tree"
                    general_fallback_display = "Foliage of a woody tree — species could not be determined with confidence"
                    general_fallback_desc = "Botanical General Analysis: Foliage of a woody tree. Species could not be determined with confidence (>75%)."
                else:
                    crop_name = "General Plant"
                    general_fallback_display = "General plant — species could not be determined with confidence"
                    general_fallback_desc = "Botanical General Analysis: General plant foliage. Species could not be determined with confidence (>75%)."
            elif detected_part == "fruit":
                crop_name = "General Plant"
                general_fallback_display = "Healthy Fruit Tissue" if is_healthy else "Fruit Tissue Distress / Rot"
                general_fallback_desc = "Botanical General Analysis: Plant fruit specimen. Exact species could not be determined with high confidence (>75%)."
            elif detected_part == "seed":
                crop_name = "Plant Seed"
                general_fallback_display = "Plant seed / grain — general analysis"
                general_fallback_desc = "Botanical General Analysis: This appears to be a plant seed, grain, or kernel. Species could not be determined with confidence (>75%)."
            elif detected_part == "stem":
                if tax_category == "tree" or "Tree" in crop_name:
                    crop_name = "Woody Tree"
                    general_fallback_display = "Woody tree trunk / stem — general analysis"
                    general_fallback_desc = "Botanical General Analysis: This appears to be the trunk or woody stem of a tree."
                else:
                    crop_name = "General Plant"
                    general_fallback_display = "Herbaceous stem — general analysis"
                    general_fallback_desc = "Botanical General Analysis: This appears to be a stem of a herbaceous plant."
            else:
                crop_name = "General Plant"
                general_fallback_display = "General plant — species could not be determined with confidence"
                general_fallback_desc = "Botanical General Analysis: General plant specimen. Species could not be determined with confidence (>75%)."

        # Determine definitive botanical scientific name, habit, and plant type
        tax = BOTANICAL_TAXONOMY.get(crop_name, {})
        scientific_name = prediction.get('scientific_name') or tax.get("scientific", "Plantae (Botanical Specimen)")
        plant_habit = prediction.get('plant_habit') or tax.get("habit", "Plant (தாவரம்)")
        plant_type = prediction.get('plant_type') or tax.get("plant_type", "Botanical Specimen")

        # Find matching disease in database strictly for this crop
        disease_obj = Disease.objects.filter(
            Q(crop__iexact=crop_name) & Q(name__icontains=disease_name) & Q(plant_part__iexact=detected_part)
        ).first()

        if not disease_obj:
            disease_obj = Disease.objects.filter(
                Q(crop__iexact=crop_name) & Q(name__icontains=disease_name)
            ).first()

        if not disease_obj and is_healthy:
            disease_obj = Disease.objects.filter(
                Q(crop__iexact=crop_name) & Q(severity_level='healthy')
            ).first()

        # Build response payload - prioritize dynamic Multimodal AI vision if available
        if prediction.get('symptoms') and prediction.get('organic_treatment'):
            display_name = prediction.get('predicted_disease_name') or (f"Healthy {crop_name}" if is_healthy else f"{crop_name} {disease_name}")
            symptoms = prediction.get('symptoms', '')
            organic_treatment = prediction.get('organic_treatment', '')
            chemical_treatment = prediction.get('chemical_treatment', '')
            prevention_tips = prediction.get('prevention_tips', '')
            severity_level = prediction.get('severity_level', 'healthy' if is_healthy else 'moderate')
            description = prediction.get('description') or f"Botanical analysis of {crop_name} ({scientific_name}) identifying {display_name}."
        elif disease_obj:
            symptoms = disease_obj.symptoms
            organic_treatment = disease_obj.organic_treatment
            chemical_treatment = disease_obj.chemical_treatment
            prevention_tips = disease_obj.prevention_tips
            description = disease_obj.description
            severity_level = disease_obj.severity_level
            display_name = general_fallback_display or disease_obj.name
            if general_fallback_desc:
                description = general_fallback_desc
        else:
            crop_label = crop_name if crop_name not in ["General Plant", "Plant"] else "Plant"
            if general_fallback_display:
                display_name = general_fallback_display
                if general_fallback_desc:
                    description = general_fallback_desc
            elif is_healthy:
                disease_name = "None (Healthy Plant)"
                display_name = f"Healthy {crop_label} {detected_part.capitalize()}"
            else:
                display_name = f"{crop_label} {disease_name}"
            if detected_part == "flower":
                if is_healthy:
                    display_name = f"Healthy {crop_label} Blossom"
                    description = f"The {crop_label} blossom displays vibrant petal pigmentation, active floral nectar glands, and healthy calyx with no fungal molds."
                    symptoms = "Vibrant petal coloration, uniform blossom anatomy, healthy pistil and stamens, no signs of mold or thrips."
                    organic_treatment = "Spray dilute potassium bicarbonate (3g/L) to prevent bloom blights and maintain optimal airflow around blossoms."
                    chemical_treatment = "No chemical fungicides required on healthy blooms."
                    prevention_tips = "Avoid overhead irrigation during flowering to prevent bloom rot; provide adequate morning sunlight."
                    severity_level = "healthy"
                else:
                    display_name = f"{crop_label} Blossom Blight / Petal Mold"
                    description = f"Floral blight or fungal mold detected on {crop_label} petals, compromising bloom health and fruit set."
                    symptoms = "Brown water-soaked petal spots, fuzzy gray fungal sporulation, and premature flower drop."
                    organic_treatment = "Gently prune and remove blighted blossoms. Apply biological Bacillus subtilis or bio-sulfur spray."
                    chemical_treatment = "Apply targeted bloom fungicide (e.g., Fenhexamid or Iprodione) per label directions."
                    prevention_tips = "Water strictly at root zone and space plants for maximum blossom air circulation."
                    severity_level = "moderate"
            elif detected_part == "fruit":
                if is_healthy:
                    display_name = f"Healthy {crop_label} Fruit"
                    description = f"The {crop_label} fruit displays smooth pericarp epidermis, uniform maturation, and healthy cuticle integrity."
                    symptoms = "Smooth fruit skin, characteristic varietal color, firm turgor, no sunken necrotic lesions or rot."
                    organic_treatment = "Apply organic calcium spray to strengthen fruit cell walls and prevent blossom end rot."
                    chemical_treatment = "No chemical intervention needed."
                    prevention_tips = "Maintain consistent soil moisture and protect fruit from excessive sunscald."
                    severity_level = "healthy"
                else:
                    display_name = f"{crop_label} Fruit Rot / Anthracnose"
                    description = f"Fungal fruit rot or anthracnose lesions observed on {crop_label} fruit tissue."
                    symptoms = "Circular sunken dark spots, concentric rings of fungal decay, and soft rotting flesh."
                    organic_treatment = "Harvest and safely destroy rotting fruit. Spray copper octanoate or neem extract."
                    chemical_treatment = "Apply protective copper hydroxide or azoxystrobin fungicide before lesion expansion."
                    prevention_tips = "Mulch soil to prevent rain splash dispersal from ground to low-hanging fruit."
                    severity_level = "severe"
            elif detected_part == "stem":
                if crop_name == "Woody Tree":
                    if is_healthy:
                        disease_name = "None (Healthy Tree Trunk / Bark)"
                        display_name = "Healthy Tree Trunk & Bark"
                        description = "The woody tree trunk exhibits sound periderm bark, healthy vascular cambium, and strong structural integrity with no wood-borers or cankers."
                        symptoms = "Intact bark, uniform natural furrowing, no bleeding cankers, no fungal conks, and healthy sapwood."
                        organic_treatment = "Apply organic tree trunk whitewash (hydrated lime + water) to prevent sunscald; wrap young trunks during winter."
                        chemical_treatment = "No chemical intervention needed for sound woody trunks."
                        prevention_tips = "Avoid weed-trimmer bark wounds, maintain healthy root aeration, and prune only during dormant season."
                        severity_level = "healthy"
                    else:
                        display_name = "Tree Bark Canker / Wood Rot"
                        description = "Fungal or bacterial canker attacking the tree trunk bark, girdling vascular tissue and threatening tree health."
                        symptoms = "Sunken oozing bark lesions, weeping dark sap, cracked bark fissures, and branch dieback."
                        organic_treatment = "Carefully excise dead cankered bark back to healthy green cambium. Disinfect wound with copper fungicide paste."
                        chemical_treatment = "Apply targeted copper hydroxide or systemic phosphite spray per arborist instructions."
                        prevention_tips = "Disinfect pruning saws between trees and protect trunk from mechanical collision damage."
                        severity_level = "severe"
                elif is_healthy:
                    display_name = f"Healthy {crop_label} Stem"
                    description = f"The {crop_label} stem exhibits vigorous vascular tissue, firm epidermis, and healthy cambium with no cankers."
                    symptoms = "Firm stem epidermis, healthy nodal development, no necrotic lesions or vascular browning."
                    organic_treatment = "Maintain balanced organic potassium and calcium nutrition for strong stalk cell walls."
                    chemical_treatment = "No chemical intervention required."
                    prevention_tips = "Avoid wounding stems during cultivation and maintain optimal plant spacing for airflow."
                    severity_level = "healthy"
                elif "Canker" in disease_name or "Rot" in disease_name:
                    display_name = f"{crop_label} Stem Canker / Timber Rot"
                    description = f"Necrotic stem lesions or fungal cankers detected on {crop_label} stalk, threatening vascular sap flow."
                    symptoms = "Sunken dark brown cankers, split bark, and wilting of upper foliage."
                    organic_treatment = "Prune lower infected stems cleanly. Paint cuts with bio-fungicide copper paste."
                    chemical_treatment = "Apply targeted protective fungicide (e.g., Thiophanate-methyl or Copper hydroxide)."
                    prevention_tips = "Disinfect pruning shears between plants and prevent physical stem abrasion."
                    severity_level = "severe"
                else:
                    display_name = f"{crop_label} {disease_name}"
                    description = f"Vascular or structural distress detected on {crop_label} stem."
                    symptoms = "Discoloration along the main stem axis."
                    organic_treatment = "Apply bio-control Trichoderma drench and support plant with sterile stakes."
                    chemical_treatment = "Apply broad-spectrum bactericide or fungicide."
                    prevention_tips = "Improve drainage and avoid mechanical stem damage."
                    severity_level = "moderate"
            elif detected_part == "root":
                if crop_name == "Tree Root":
                    if is_healthy:
                        disease_name = "None (Healthy Tree Root System)"
                        display_name = "Healthy Tree Root System"
                        description = "The tree root system exhibits healthy lignified woody bark, active mycorrhizal feeder roots, strong structural anchor taproots, and no signs of wood-decay fungi or rot."
                        symptoms = "Firm woody bark, intact root collar/flare, healthy soil moisture integration, no black slimy decay or fungal brackets/mushrooms."
                        organic_treatment = "Maintain 2-3 inches of organic wood chip mulch around the drip line (keep 6 inches away from tree root flare). Drench root zone with beneficial Trichoderma harzianum to ward off soil-borne pathogens."
                        chemical_treatment = "No chemical intervention needed for healthy tree roots. Avoid chemical herbicide runoff near root zone."
                        prevention_tips = "Avoid soil compaction over root zones, protect roots from heavy equipment, ensure adequate radial drainage, and never bury the root collar with excess soil."
                        severity_level = "healthy"
                    elif "Rot" in disease_name or "Armillaria" in disease_name or "Phytophthora" in disease_name:
                        display_name = "Tree Root Rot (Armillaria / Phytophthora Root Disease)"
                        description = "Fungal root rot or Armillaria wood-decay fungal infection attacking the woody tree root system, compromising tree stability and sap transport."
                        symptoms = "Decaying, soft, spongy, or black water-soaked root bark, white fungal mycelial mats under root bark, fungal conks/mushrooms near root base, crown branch dieback."
                        organic_treatment = "Excavate soil gently around the root collar (root flare excavation) to aerate the base. Drench affected root zone with bio-fungicide Bacillus subtilis or Trichoderma viride."
                        chemical_treatment = "Apply targeted systemic fungicide root drench (e.g., Fosetyl-Al or Mefenoxam) for Phytophthora root rot per arboricultural extension guidelines."
                        prevention_tips = "Correct waterlogging and poor soil drainage around the tree. Avoid mechanical injury from lawnmowers or trenching through primary anchor roots."
                        severity_level = "severe"
                    else:
                        display_name = "Tree Root Knot Nematode Infection"
                        description = "Nematode infestation causing galling and vascular stunting on woody tree roots."
                        symptoms = "Swollen knots/galls on root fibers, stunted nutrient uptake, and daytime leaf wilt."
                        organic_treatment = "Apply neem cake soil amendment and bio-nematicide (Paecilomyces lilacinus)."
                        chemical_treatment = "Apply registered soil nematicide according to extension guidelines."
                        prevention_tips = "Solarize soil between crops and plant marigolds (Tagetes) as antagonistic companion crop."
                        severity_level = "severe"
                elif is_healthy:
                    display_name = f"Healthy {crop_label} Root System"
                    description = f"Vigorous feeder root architecture with active root hair development and healthy mycorrhizal association."
                    symptoms = "Crisp white/tan root tips, strong turgor, no dark water-soaked rot or galls."
                    organic_treatment = "Incorporate mycorrhizal fungi and compost tea into the root zone."
                    chemical_treatment = "No chemical drench required."
                    prevention_tips = "Ensure well-aerated, well-draining soil and avoid over-irrigation."
                    severity_level = "healthy"
                elif "Nematode" in disease_name or "Knot" in disease_name:
                    display_name = f"{crop_label} Root Knot Nematode"
                    description = f"Root galling and nematode infestation detected on {crop_label} root system."
                    symptoms = "Swollen knots/galls on root fibers, stunted nutrient uptake, and daytime leaf wilt."
                    organic_treatment = "Apply neem cake soil amendment and bio-nematicide (Paecilomyces lilacinus)."
                    chemical_treatment = "Apply registered soil nematicide according to extension guidelines."
                    prevention_tips = "Solarize soil between crops and plant marigolds (Tagetes) as antagonistic companion crop."
                    severity_level = "severe"
                else:
                    display_name = f"{crop_label} Root Rot (Pythium / Rhizoctonia)"
                    description = f"Fungal root rot infection causing root cortex decay and root loss on {crop_label}."
                    symptoms = "Brown or black slimy water-soaked roots, sloughing root cortex, and severe plant wilting."
                    organic_treatment = "Drench root zone with Bacillus subtilis or Trichoderma harzianum. Let soil dry out."
                    chemical_treatment = "Apply metalaxyl or mefenoxam root drench."
                    prevention_tips = "Elevate garden beds, improve drainage, and never allow roots to sit in stagnant water."
                    severity_level = "severe"
            elif detected_part == "seed":
                if is_healthy:
                    display_name = general_fallback_display or f"Healthy {crop_label} Seed / Grain"
                    description = general_fallback_desc or f"The {crop_label} seed exhibits sound coat integrity, healthy embryo, and uniform germination potential with no fungal molds."
                    symptoms = "Intact seed coat, normal color and luster, no mold spores, no insect emergence holes, healthy moisture level (< 12%)."
                    organic_treatment = "Store seeds in airtight containers with dry neem leaves or food-grade diatomaceous earth to prevent weevils and molds."
                    chemical_treatment = "No chemical seed treatment required for sound dry grain."
                    prevention_tips = "Ensure seeds are properly sun-dried to below 12% moisture before storage; maintain cool and well-aerated storage conditions."
                    severity_level = "healthy"
                else:
                    display_name = general_fallback_display or f"{crop_label} Seed Storage Mold / Decay"
                    description = general_fallback_desc or f"Fungal seed mold or storage decay detected on {crop_label} seed coat, threatening seed viability."
                    symptoms = "White, gray, or greenish fungal mycelial dusting on seed coat, sunken dark necrosis, and shriveled cotyledons."
                    organic_treatment = "Discard heavily molded seeds. Treat remaining viable seed lots with Trichoderma viride powder (4g/kg seed) or hot water soak (50°C for 10 min)."
                    chemical_treatment = "Apply certified seed-dressing fungicide (e.g. Thiram or Carbendazim @ 2g/kg seed) prior to planting."
                    prevention_tips = "Harvest seeds during dry weather, dry thoroughly, and store in hermetic seed bags away from humid walls."
                    severity_level = "severe"
            else:  # Leaf
                if is_healthy or disease_name in ["Healthy", "Healthy Foliage"]:
                    display_name = f"Healthy {crop_label} Foliage"
                    description = f"The {crop_label} foliage exhibits vibrant chlorophyll pigmentation and healthy cellular structure with no detected foliar pathogens."
                    symptoms = "Normal leaf coloration, active chlorophyll reflectance, uniform cellular structure, no lesions or chlorosis."
                    organic_treatment = "Maintain balanced organic fertilization (vermicompost, balanced N-P-K), adequate sunlight, and proper root aeration."
                    chemical_treatment = "No chemical pesticides or fungicides required. Continue regular scouting."
                    prevention_tips = "Ensure proper plant spacing, avoid waterlogged roots, and use drip irrigation at soil level."
                    severity_level = "healthy"
                elif "Spot" in disease_name or "Anthracnose" in disease_name:
                    display_name = f"{crop_label} Leaf Spot (Foliar Infection)"
                    description = f"Necrotic spotting detected on {crop_label} foliage, characteristic of fungal (Cercospora / Alternaria) or bacterial spot pathogens."
                    symptoms = "Scattered brown or black circular lesions, dark water-soaked margins, often surrounded by chlorotic yellow halos."
                    organic_treatment = "Apply copper-based bio-fungicide or cold-pressed neem oil extract (5ml/L). Prune infected lower leaves and safely discard."
                    chemical_treatment = "Apply broad-spectrum protectant fungicide such as Chlorothalonil or Mancozeb as directed."
                    prevention_tips = "Water at the base of the plant (avoid wetting leaves), sanitize pruning tools, and ensure good air circulation."
                    severity_level = "moderate"
                elif "Blight" in disease_name:
                    display_name = f"{crop_label} Leaf Blight"
                    description = f"Foliar tissue necrosis and spreading lesions detected on {crop_label} leaf, requiring prompt intervention."
                    symptoms = "Large expanding water-soaked brown patches, rapid tissue collapse, and leaf blade wilting."
                    organic_treatment = "Immediately remove and destroy blighted foliage. Apply copper hydroxide bio-spray and compost tea."
                    chemical_treatment = "Apply systemic fungicide (e.g., Metalaxyl + Mancozeb) following manufacturer dosage instructions."
                    prevention_tips = "Avoid overhead sprinkler watering, improve drainage, and practice 2-3 year crop rotation."
                    severity_level = "severe"
                elif "Chlorosis" in disease_name or "Deficiency" in disease_name:
                    display_name = f"{crop_label} Chlorosis / Nutrient Deficiency"
                    description = f"Chlorophyll depletion observed on {crop_label} leaf, typically caused by nitrogen, iron, or micronutrient deficiency."
                    symptoms = "Pale yellow leaf blades, interveinal yellowing (green veins with yellow tissue), and reduced photosynthetic vigor."
                    organic_treatment = "Foliar feed with diluted seaweed extract and chelated iron (Fe-EDTA). Top-dress soil with well-rotted vermicompost."
                    chemical_treatment = "Apply water-soluble complete micronutrient foliar spray (Zinc, Iron, Manganese) and balanced 19:19:19 NPK."
                    prevention_tips = "Test soil pH (aim for 6.0 - 6.8), prevent root waterlogging, and mulch to retain organic matter."
                    severity_level = "mild"
                elif "Rust" in disease_name:
                    display_name = f"{crop_label} Foliar Rust"
                    description = f"Fungal rust pustules detected on {crop_label} foliage, causing premature defoliation and nutrient loss."
                    symptoms = "Powdery cinnamon, orange, or reddish-brown raised pustules on the leaf surface and undersides."
                    organic_treatment = "Dust with wettable sulfur powder or spray cold-pressed neem oil (5ml/L) early in the morning."
                    chemical_treatment = "Apply Triazole or Azoxystrobin fungicide according to regional agricultural guidelines."
                    prevention_tips = "Thin out crowded foliage to maximize airflow, avoid working with plants while wet, and clear fallen leaf debris."
                    severity_level = "moderate"
                else:
                    display_name = f"{crop_label} {disease_name}"
                    description = f"Pathological foliar condition detected on {crop_label} leaf consistent with {disease_name}."
                    symptoms = "Leaf spots, discoloration, and structural degradation."
                    organic_treatment = "Apply copper-based bio-fungicide and prune affected foliage."
                    chemical_treatment = "Apply broad-spectrum targeted fungicide according to manufacturer instructions."
                    prevention_tips = "Avoid overhead irrigation, disinfect cutting tools, and ensure crop rotation."
                    severity_level = "moderate"

        # Auto-record into ScanHistory if user is authenticated
        scan_id = None
        if request.user and request.user.is_authenticated:
            # Rewind file pointer to save image
            image_file.seek(0)
            scan_record = ScanHistory.objects.create(
                user=request.user,
                image=image_file,
                disease=disease_obj,
                predicted_disease_name=display_name,
                crop=crop_name,
                scientific_name=scientific_name,
                detected_plant_part=detected_part,
                is_valid_plant_image=True,
                confidence=confidence,
                is_healthy=is_healthy,
                notes=request.data.get('notes', '')
            )
            scan_id = scan_record.id

        # Record full inference audit log
        try:
            PredictionAuditLog.objects.create(
                user=request.user if request.user and request.user.is_authenticated else None,
                input_image_name=getattr(image_file, 'name', '') or 'uploaded_image',
                detected_plant_part=detected_part,
                part_confidence_raw=float(prediction.get('part_confidence_raw', 0.0) or 0.0),
                part_confidence_calibrated=float(prediction.get('validation_score', confidence) or 0.0),
                predicted_species=crop_name,
                species_confidence_raw=float(prediction.get('part_confidence_raw', confidence) or 0.0),
                species_confidence_calibrated=float(confidence or 0.0),
                predicted_disease=disease_name,
                disease_confidence_raw=float(prediction.get('disease_confidence_raw', confidence) or 0.0),
                disease_confidence_calibrated=float(confidence or 0.0),
                final_confidence=float(confidence or 0.0),
                calibration_method=prediction.get('calibration_method', 'temperature_scaling + platt_empirical'),
                taxonomy_check_passed=bool(is_tax_consistent),
                correction_applied=bool(prediction.get('correction_applied', False)),
                correction_reason=str(prediction.get('correction_reason', '') or tax_reason or '')
            )
        except Exception as audit_err:
            logger.warning(f"Could not record inference audit log: {audit_err}")

        return Response({
            'scan_id': scan_id,
            'is_valid_plant_image': True,
            'is_valid_plant': True,
            'is_valid_leaf': True,
            'detected_plant_part': detected_part,
            'plant_part': detected_part,
            'crop': crop_name,
            'plant_habit': plant_habit,
            'plant_type': plant_type,
            'disease': disease_name,
            'predicted_disease_name': display_name,
            'scientific_name': scientific_name,
            'confidence': confidence,
            'is_healthy': is_healthy,
            'severity_level': severity_level,
            'description': description,
            'symptoms': symptoms,
            'organic_treatment': organic_treatment,
            'chemical_treatment': chemical_treatment,
            'prevention_tips': prevention_tips,
            'ai_engine': prediction.get('ai_engine', 'PlantCure AI Botanical Engine'),
            'top_predictions': prediction.get('top_predictions', [])
        }, status=status.HTTP_200_OK)


class ScanHistoryListView(APIView):
    """
    Returns scan history for the authenticated user.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        scans = ScanHistory.objects.filter(user=request.user).select_related('disease')
        serializer = ScanHistorySerializer(scans, many=True, context={'request': request})
        return Response({
            'count': scans.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)

    def post(self, request):
        # Allow creating or associating a scan record manually (including invalid attempts tagged separately)
        image_file = request.FILES.get('image')
        disease_name = request.data.get('predicted_disease_name', 'Unknown')
        confidence = float(request.data.get('confidence', 0))
        crop = request.data.get('crop', '')
        is_healthy = request.data.get('is_healthy', 'false').lower() == 'true'
        is_valid = request.data.get('is_valid_plant_image', 'true').lower() == 'true'
        plant_part = request.data.get('detected_plant_part', 'leaf')

        scientific_name = request.data.get('scientific_name', '')

        if not image_file:
            return Response({'detail': 'Image is required.'}, status=status.HTTP_400_BAD_REQUEST)

        scan = ScanHistory.objects.create(
            user=request.user,
            image=image_file,
            predicted_disease_name=disease_name,
            crop=crop,
            scientific_name=scientific_name,
            detected_plant_part=plant_part,
            is_valid_plant_image=is_valid,
            confidence=confidence,
            is_healthy=is_healthy,
            notes=request.data.get('notes', '')
        )
        serializer = ScanHistorySerializer(scan, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ScanHistoryDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            scan = ScanHistory.objects.get(pk=pk, user=request.user)
            serializer = ScanHistorySerializer(scan, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except ScanHistory.DoesNotExist:
            return Response({'detail': 'Scan record not found.'}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            scan = ScanHistory.objects.get(pk=pk, user=request.user)
            scan.delete()
            return Response({'message': 'Scan record deleted successfully.'}, status=status.HTTP_200_OK)
        except ScanHistory.DoesNotExist:
            return Response({'detail': 'Scan record not found.'}, status=status.HTTP_404_NOT_FOUND)


class AIStatusConfigView(APIView):
    """
    Returns the AI status and configuration capabilities.
    Checks whether Gemini API key is configured in environment or settings.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        import os
        from django.conf import settings
        has_gemini = bool(os.environ.get('GEMINI_API_KEY') or getattr(settings, 'GEMINI_API_KEY', None))
        return Response({
            'gemini_configured': has_gemini,
            'active_engine': 'Google Gemini Vision AI' if has_gemini else 'Botanical Taxonomy & MobileNetV2 Engine',
            'supported_organs': [
                {'id': 'leaf', 'label': 'Leaf / Foliage 🌿'},
                {'id': 'flower', 'label': 'Flower / Blossom 🌸'},
                {'id': 'fruit', 'label': 'Fruit / Pod 🍎'},
                {'id': 'stem', 'label': 'Stem / Branch 🎋'},
                {'id': 'root', 'label': 'Root System 🥕'},
                {'id': 'seed', 'label': 'Seed / Grain 🌰'}
            ],
            'features': [
                'Precise real plant species identification with Latin binomial nomenclature',
                'Visual symptom analysis directly derived from uploaded photo',
                'Zero arbitrary guessing (no default Tomato or hardcoded crops)',
                'Support for all plant parts: leaves, flowers, fruits, stems, roots'
            ]
        }, status=status.HTTP_200_OK)
