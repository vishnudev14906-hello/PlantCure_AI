from django.core.management.base import BaseCommand
from diseases.models import Disease

DISEASES_DATA = [
    {
        "name": "Tomato Early Blight",
        "crop": "Tomato",
        "scientific_name": "Alternaria solani",
        "description": "Early blight is a common fungal disease affecting tomato crops worldwide. It causes premature defoliation, stem lesions, and fruit rot, reducing yield significantly if left unmanaged.",
        "symptoms": "Dark brown to black spots with concentric rings resembling a target or bullseye pattern, primarily on older bottom leaves. Leaves turn yellow around spots and eventually drop off.",
        "organic_treatment": "Spray organic copper fungicide or Bacillus subtilis biopesticide every 7-10 days. Prune bottom leaves within 12 inches of the soil to prevent fungal spores splashing from soil. Mulch heavily.",
        "chemical_treatment": "Apply protectant fungicides containing chlorothalonil, mancozeb, or azoxystrobin at the first sign of lesions.",
        "prevention_tips": "Practice 3-year crop rotation avoiding solanaceous crops. Water with drip irrigation at the base rather than overhead sprinklers. Space plants adequately for air circulation.",
        "severity_level": "moderate",
        "image_sample": "https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Tomato Late Blight",
        "crop": "Tomato",
        "scientific_name": "Phytophthora infestans",
        "description": "A destructive water mold (oomycete) pathogen responsible for the historic Irish Potato Famine. Under cool, damp conditions it can decimate entire tomato fields within days.",
        "symptoms": "Large, irregular water-soaked dark lesions on leaves and stems. In humid mornings, delicate white fuzzy mold appears on the undersides of leaves. Stems turn brown and brittle; fruit develops greasy brown rot.",
        "organic_treatment": "Immediately remove and destroy (burn/bag) severely infected plants. Apply copper sulfate or bio-fungicides to uninfected neighboring plants as preventative protection.",
        "chemical_treatment": "Apply translaminar or systemic fungicides containing cymoxanil, dimethomorph, or mandipropamid combined with a protectant fungicide.",
        "prevention_tips": "Avoid growing tomatoes adjacent to potatoes. Plant late-blight-resistant cultivars (e.g., Defiant, Mountain Merit). Eliminate volunteer potato and tomato plants in spring.",
        "severity_level": "severe",
        "image_sample": "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e17?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Tomato Bacterial Spot",
        "crop": "Tomato",
        "scientific_name": "Xanthomonas campestris pv. vesicatoria",
        "description": "A seed-borne and water-splashed bacterial infection prevalent in warm, humid growing seasons that blemishes leaves and fruits.",
        "symptoms": "Small, dark, water-soaked circular or angular spots (1-3mm) with distinct yellow halos. Spots rarely exceed 3mm and do not have concentric rings. Leaves turn brown and tear easily.",
        "organic_treatment": "Apply liquid copper sprays mixed with organic copper-tolerant Bacillus amyloliquefaciens. Spray early in the morning so foliage dries quickly.",
        "chemical_treatment": "Apply fixed copper bactericides combined with mancozeb to increase bactericidal efficacy.",
        "prevention_tips": "Always purchase certified disease-free seeds or hot-water treated seeds. Never work in wet tomato fields. Disinfect trellises, stakes, and pruning shears between plants.",
        "severity_level": "moderate",
        "image_sample": "https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Tomato Leaf Mold",
        "crop": "Tomato",
        "scientific_name": "Passalora fulva",
        "description": "Fungal pathogen frequent in greenhouses, high tunnels, and humid outdoor environments that targets tomato foliage.",
        "symptoms": "Pale yellow, indistinct blotches on the upper leaf surface, with dense olive-green or grayish-brown velvety fungal sporulation on the underside.",
        "organic_treatment": "Increase ventilation and reduce humidity below 80%. Apply bio-fungicides containing Bacillus subtilis or compost tea sprays.",
        "chemical_treatment": "Apply preventative fungicides containing chlorothalonil, thiophanate-methyl, or copper hydroxide.",
        "prevention_tips": "Ensure maximum greenhouse airflow using horizontal fans. Space plants widely and prune suckers to optimize light penetration.",
        "severity_level": "mild",
        "image_sample": "https://images.unsplash.com/photo-1594488518042-3004b32fae20?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Tomato Yellow Leaf Curl Virus",
        "crop": "Tomato",
        "scientific_name": "Tomato yellow leaf curl virus (TYLCV)",
        "description": "A destructive viral disease transmitted by the silverleaf whitefly (Bemisia tabaci). Infected plants exhibit extreme stunting and virtually no fruit set.",
        "symptoms": "Upward curling and cupping of leaf margins, severe chlorosis (yellowing), reduced leaf size, and tight bushy plant stunting.",
        "organic_treatment": "Control whitefly vectors using yellow sticky cards, insecticidal soaps, and neem oil. Remove and destroy virus-infected plants promptly.",
        "chemical_treatment": "Direct treatments against the virus do not exist. Target whitefly vectors with systemic insecticides like imidacloprid or acetamiprid.",
        "prevention_tips": "Plant TYLCV-resistant hybrids (e.g., Tycoon, Skyway). Use 50-mesh insect screening in nurseries and greenhouses. Eliminate weed hosts like nightshade.",
        "severity_level": "severe",
        "image_sample": "https://images.unsplash.com/photo-1598512752271-33f913a5af13?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Tomato Healthy",
        "crop": "Tomato",
        "scientific_name": "Solanum lycopersicum",
        "description": "The tomato foliage is vigorous, uniformly green, and free of visible fungal, bacterial, or viral symptoms.",
        "symptoms": "Deep green, supple leaves with no chlorosis, necrotic spotting, wilt, or fungal mycelium.",
        "organic_treatment": "Continue regular feeding with organic fish emulsion, kelp meal, and well-composted organic matter. Maintain even soil moisture.",
        "chemical_treatment": "No chemical treatment is required. Preventative scouting is recommended.",
        "prevention_tips": "Maintain standard cultural practices: stake vines, prune dead lower leaves, mulch soil, and monitor bi-weekly for pests.",
        "severity_level": "healthy",
        "image_sample": "https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Potato Early Blight",
        "crop": "Potato",
        "scientific_name": "Alternaria solani",
        "description": "Fungal disease causing target-like leaf spots that reduce tuber yield and size, especially during periods of alternating wet and dry weather.",
        "symptoms": "Brown to black spots with concentric rings starting on lower mature leaves, surrounded by yellow tissue. Foliage gradually dies back.",
        "organic_treatment": "Apply copper-based fungicides every 10 days starting at tuber initiation. Ensure adequate plant nutrition, especially potassium.",
        "chemical_treatment": "Spray azoxystrobin, pyraclostrobin, or chlorothalonil on a preventative calendar schedule.",
        "prevention_tips": "Use certified disease-free seed tubers. Maintain proper hilling to prevent spore wash-down onto tubers. Rotate crops with non-solanaceous species.",
        "severity_level": "moderate",
        "image_sample": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Potato Late Blight",
        "crop": "Potato",
        "scientific_name": "Phytophthora infestans",
        "description": "The devastating pathogen of historical fame that attacks both potato foliage and tubers, causing rapid decay in field and storage.",
        "symptoms": "Water-soaked lesions on leaf margins that expand rapidly into brown necrotic patches. White mildew visible on underside in high humidity. Tubers rot with reddish-brown granular flesh.",
        "organic_treatment": "Destroy infected haulms immediately. Spray preventive fixed copper at 5-7 day intervals when late blight forecast warnings are issued.",
        "chemical_treatment": "Apply systemic fungicides such as mefenoxam, fluopicolide, or cyazofamid according to regional blight warnings.",
        "prevention_tips": "Destroy cull piles before the season starts. Kill vines 2-3 weeks before harvest to prevent tuber contamination during lifting.",
        "severity_level": "severe",
        "image_sample": "https://images.unsplash.com/photo-1589927986086-3d10fb556617?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Potato Healthy",
        "crop": "Potato",
        "scientific_name": "Solanum tuberosum",
        "description": "The potato canopy is healthy, lush, and actively photosynthesizing to maximize tuber bulking.",
        "symptoms": "Intact, uniform green leaflets without lesions, browning, or mosaic mottling.",
        "organic_treatment": "Maintain balanced organic fertilization and hill soil around stems to protect developing tubers from sun and pests.",
        "chemical_treatment": "None required.",
        "prevention_tips": "Regularly monitor for Colorado potato beetles and blight conditions. Keep soil evenly moist.",
        "severity_level": "healthy",
        "image_sample": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Corn Common Rust",
        "crop": "Corn",
        "scientific_name": "Puccinia sorghi",
        "description": "A fungal rust disease carried by southerly winds into cornfields. When conditions are cool and wet, it forms characteristic rust-red spore pustules.",
        "symptoms": "Elongated, cinnamon-brown to golden pustules (uredinia) on both upper and lower leaf surfaces. Pustules rupture the epidermis, releasing powdery rust-colored spores.",
        "organic_treatment": "Apply neem oil or sulfur dusting early in the season. Most field corn handles low levels without significant economic loss.",
        "chemical_treatment": "Apply triazole or strobilurin fungicides (e.g., azoxystrobin + propiconazole) if rust reaches ear leaf around silking stage.",
        "prevention_tips": "Plant rust-resistant corn hybrids with Rp-resistance genes. Plant early in the season to avoid peak spore showers.",
        "severity_level": "moderate",
        "image_sample": "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Corn Northern Leaf Blight",
        "crop": "Corn",
        "scientific_name": "Exserohilum turcicum",
        "description": "One of the most damaging foliar diseases of sweet and field corn in humid climates, producing long cigar-shaped lesions that reduce grain fill.",
        "symptoms": "Long, elliptical, grayish-green to tan lesions (1 to 6 inches long) resembling cigars. In damp conditions, dark olivaceous fungal spores form inside lesions.",
        "organic_treatment": "Incorporate bio-fungicides like Trichoderma virens into soil. Till crop debris post-harvest to speed fungal breakdown.",
        "chemical_treatment": "Fungicide sprays (pyraclostrobin or fluxapyroxad) applied between V12 and R2 stages when disease pressure is high.",
        "prevention_tips": "Select hybrid varieties with high polygenic resistance. Rotate corn with soybeans or other non-grass crops for at least one full season.",
        "severity_level": "moderate",
        "image_sample": "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Corn Healthy",
        "crop": "Corn",
        "scientific_name": "Zea mays",
        "description": "Thriving corn stalks with clean, broad green leaf blades with no evidence of fungal pustules or blight lesions.",
        "symptoms": "Robust, deep-green, arching leaves with intact margins and healthy chlorophyll density.",
        "organic_treatment": "Apply side-dressing of organic nitrogen (blood meal, feathered meal) and ensure adequate irrigation during pollination.",
        "chemical_treatment": "None required.",
        "prevention_tips": "Maintain proper plant density (30,000-35,000 plants/acre), ensure balanced soil nutrition, and scout weekly.",
        "severity_level": "healthy",
        "image_sample": "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Apple Scab",
        "crop": "Apple",
        "scientific_name": "Venturia inaequalis",
        "description": "The premier fungal disease of apples worldwide. Attacks both leaves and fruit, causing corky blemishes and fruit deformity.",
        "symptoms": "Olive-green to velvety dark brown lesions on leaves and fruit. Leaves curl and drop prematurely. Fruit develops dark, scab-like crusty spots.",
        "organic_treatment": "Apply liquid sulfur or copper fungicides during bud-break through petal fall. Flail mow or rake fallen orchard leaves in autumn.",
        "chemical_treatment": "Apply myclobutanil, captan, or mancozeb at tight cluster, pink, and bloom stages.",
        "prevention_tips": "Plant scab-resistant cultivars (e.g., Liberty, Enterprise, Freedom). Prune trees yearly for maximum sunlight and rapid leaf drying.",
        "severity_level": "moderate",
        "image_sample": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Apple Healthy",
        "crop": "Apple",
        "scientific_name": "Malus domestica",
        "description": "Healthy apple tree foliage with vibrant leaves facilitating optimal carbohydrate synthesis for fruit production.",
        "symptoms": "Glossy green leaves with smooth edges and no fungal crusts, mildew, or spots.",
        "organic_treatment": "Maintain balanced orchard nutrition, dormant oil spraying for overwintering pests, and regular mulching.",
        "chemical_treatment": "None required.",
        "prevention_tips": "Winter dormant pruning to maintain an open vase or central leader canopy structure.",
        "severity_level": "healthy",
        "image_sample": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Grape Black Rot",
        "crop": "Grape",
        "scientific_name": "Guignardia bidwellii",
        "description": "A destructive disease of cultivated grapes that attacks all green vine tissues, turning succulent grape clusters into shriveled black mummies.",
        "symptoms": "Small, circular brown spots on leaves with tiny black dots (pycnidia) arranged in a ring. Berries turn brown, wrinkle, and dry into hard black mummies.",
        "organic_treatment": "Apply copper or sulfur fungicides beginning when new shoots are 2-4 inches long. Prune out all mummified grapes and infected canes.",
        "chemical_treatment": "Apply myclobutanil, tebuconazole, or kresoxim-methyl protectant sprays through pea-sized fruit stage.",
        "prevention_tips": "Thoroughly destroy all fruit mummies during winter pruning. Keep canopy open with shoot positioning and leaf pulling around clusters.",
        "severity_level": "severe",
        "image_sample": "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Bell Pepper Bacterial Spot",
        "crop": "Bell Pepper",
        "scientific_name": "Xanthomonas vesicatoria",
        "description": "Bacterial pathogen that causes leaf drop and fruit lesions on sweet and hot peppers, exposing fruit to sunscald.",
        "symptoms": "Water-soaked circular or angular spots with yellow halos on leaves. Lesions dry out and become papery; severe infection causes heavy defoliation.",
        "organic_treatment": "Spray copper bactericides early. Discontinue overhead irrigation immediately. Apply compost tea as a biological competitor.",
        "chemical_treatment": "Tank-mix copper hydroxide with mancozeb for improved bacterial suppression.",
        "prevention_tips": "Use disease-free seed and resistant hybrids. Maintain strict field sanitation.",
        "severity_level": "moderate",
        "image_sample": "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Bell Pepper Healthy",
        "crop": "Bell Pepper",
        "scientific_name": "Capsicum annuum",
        "description": "Vigorous bell pepper foliage with strong dark green leaves and sturdy branch framework.",
        "symptoms": "Uniform deep-green leaves with healthy turgidity and no bacterial water-soaking.",
        "organic_treatment": "Regular feeding with compost and kelp extract. Keep soil consistently moist to prevent blossom end rot.",
        "chemical_treatment": "None required.",
        "prevention_tips": "Stake plants to support heavy fruit load and keep foliage off soil.",
        "severity_level": "healthy",
        "image_sample": "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "General Plant Healthy Foliage",
        "crop": "General Plant",
        "scientific_name": "Plantae",
        "description": "Healthy, vigorous foliage from a plant, shrub, or tree exhibiting active photosynthesis and cellular vitality.",
        "symptoms": "Uniform green pigment, intact leaf margins, active chlorophyll reflectance, no necrotic spots or chlorosis.",
        "organic_treatment": "Maintain balanced organic fertilization (vermicompost, balanced N-P-K), adequate sunlight, and proper root aeration.",
        "chemical_treatment": "No chemical pesticides or fungicides required. Continue regular scouting.",
        "prevention_tips": "Ensure proper plant spacing, avoid waterlogged roots, and use drip irrigation at soil level.",
        "severity_level": "healthy",
        "image_sample": "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "General Plant Foliar Leaf Spot",
        "crop": "General Plant",
        "scientific_name": "Cercospora / Alternaria / Septoria spp.",
        "description": "Foliar leaf spot is a widespread disease caused by airborne fungal or bacterial spores creating necrotic spots on leaf blades across many plant species.",
        "symptoms": "Circular or irregular brown, tan, or black spots with dark margins and surrounding yellow chlorotic halos.",
        "organic_treatment": "Apply copper-based bio-fungicide or cold-pressed neem oil extract (5ml/L). Prune infected lower leaves and safely discard.",
        "chemical_treatment": "Apply broad-spectrum protectant fungicide such as Chlorothalonil or Mancozeb as directed.",
        "prevention_tips": "Water at the base of the plant (avoid wetting leaves), sanitize pruning tools, and ensure good air circulation.",
        "severity_level": "moderate",
        "image_sample": "https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "General Plant Foliar Leaf Blight",
        "crop": "General Plant",
        "scientific_name": "Phytophthora / Rhizoctonia spp.",
        "description": "Foliar leaf blight causes rapid discoloration, extensive tissue death, and water-soaked spreading lesions across plant foliage.",
        "symptoms": "Large expanding water-soaked brown patches, rapid tissue collapse, and leaf blade wilting.",
        "organic_treatment": "Immediately remove and destroy blighted foliage. Apply copper hydroxide bio-spray and compost tea.",
        "chemical_treatment": "Apply systemic fungicide (e.g., Metalaxyl + Mancozeb) following manufacturer dosage instructions.",
        "prevention_tips": "Avoid overhead sprinkler watering, improve bed drainage, and practice crop rotation.",
        "severity_level": "severe",
        "image_sample": "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e17?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "General Plant Chlorosis / Nutrient Deficiency",
        "crop": "General Plant",
        "scientific_name": "Nutritional Chlorosis",
        "description": "Yellowing of leaves caused by insufficient chlorophyll synthesis, commonly due to poor iron/nitrogen uptake, compacted soil, or pH imbalance.",
        "symptoms": "Pale yellow leaf blades, interveinal yellowing (green veins with yellow tissue), and reduced photosynthetic vigor.",
        "organic_treatment": "Foliar feed with diluted seaweed extract and chelated iron (Fe-EDTA). Top-dress soil with well-rotted vermicompost.",
        "chemical_treatment": "Apply water-soluble complete micronutrient foliar spray (Zinc, Iron, Manganese) and balanced 19:19:19 NPK.",
        "prevention_tips": "Test soil pH (aim for 6.0 - 6.8), prevent root waterlogging, and mulch to retain organic matter.",
        "severity_level": "mild",
        "image_sample": "https://images.unsplash.com/photo-1594488518042-3004b32fae20?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "General Plant Foliar Rust",
        "crop": "General Plant",
        "scientific_name": "Pucciniales",
        "description": "A widespread fungal infection characterized by rusty, orange, or reddish-brown spore pustules on foliage.",
        "symptoms": "Powdery cinnamon, orange, or reddish-brown raised pustules on the leaf surface and undersides, leading to premature leaf drop.",
        "organic_treatment": "Dust with wettable sulfur powder or spray cold-pressed neem oil (5ml/L) early in the morning.",
        "chemical_treatment": "Apply Triazole or Azoxystrobin fungicide according to regional agricultural guidelines.",
        "prevention_tips": "Thin out crowded foliage to maximize airflow, avoid working with plants while wet, and clear fallen leaf debris.",
        "severity_level": "moderate",
        "image_sample": "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Mango Anthracnose",
        "crop": "Mango",
        "scientific_name": "Colletotrichum gloeosporioides",
        "description": "A prevalent fungal disease affecting mango trees causing black foliar spots, blossom blight, and post-harvest fruit rot.",
        "symptoms": "Irregular dark brown or black spots on leaves which coalesce into large necrotic areas causing leaf curl and drop.",
        "organic_treatment": "Spray copper oxychloride (COC) or bio-control agents like Pseudomonas fluorescens. Prune out dead twigs after harvest.",
        "chemical_treatment": "Apply carbendazim or azoxystrobin spray during flushes of new leaf growth.",
        "prevention_tips": "Prune mango tree canopy to allow sun penetration and rapid air drying.",
        "severity_level": "moderate",
        "image_sample": "https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Mango Healthy",
        "crop": "Mango",
        "scientific_name": "Mangifera indica",
        "description": "Vigorous mango foliage with glossy leathery leaves free of fungal spots or tip burn.",
        "symptoms": "Dark green, lanceolate leaves with smooth margins and no necrotic lesions.",
        "organic_treatment": "Apply farmyard manure and micronutrients before flowering season.",
        "chemical_treatment": "None required.",
        "prevention_tips": "Maintain clean orchard floor and ensure proper drip irrigation.",
        "severity_level": "healthy",
        "image_sample": "https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Rose Black Spot",
        "crop": "Rose",
        "scientific_name": "Diplocarpon rosae",
        "description": "The most troublesome disease of rose plants, causing circular black fringed spots and widespread defoliation.",
        "symptoms": "Black circular spots with fringed edges on upper leaf surfaces. Surrounding tissue turns yellow and leaves drop.",
        "organic_treatment": "Spray baking soda solution (bicarbonate + horticultural oil) or neem oil. Pick off affected leaves.",
        "chemical_treatment": "Apply triforine, myclobutanil, or mancozeb preventative sprays.",
        "prevention_tips": "Water at the roots only, avoid overhead wetting, and prune canes to allow morning sun.",
        "severity_level": "moderate",
        "image_sample": "https://images.unsplash.com/photo-1559563458-527698bf5295?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Rose Healthy",
        "crop": "Rose",
        "scientific_name": "Rosa spp.",
        "description": "Lush, glossy rose foliage supporting abundant flower bud development.",
        "symptoms": "Vibrant green compound leaves with serrated margins and no black spotting.",
        "organic_treatment": "Feed with bone meal, compost, and seaweed extract.",
        "chemical_treatment": "None required.",
        "prevention_tips": "Annual pruning and sanitation of fallen leaves.",
        "severity_level": "healthy",
        "image_sample": "https://images.unsplash.com/photo-1559563458-527698bf5295?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Hibiscus Leaf Spot",
        "crop": "Hibiscus",
        "scientific_name": "Pseudocercospora / Alternaria spp.",
        "description": "Common fungal infection on tropical hibiscus that blemishes flowers and foliage in warm humid climates.",
        "symptoms": "Tan or brown spots with purple or dark margins across the leaf blade.",
        "organic_treatment": "Spray neem oil or bio-fungicide. Ensure adequate potassium and iron nutrition.",
        "chemical_treatment": "Apply copper hydroxide or chlorothalonil spray.",
        "prevention_tips": "Keep foliage dry overnight and space shrubs for adequate airflow.",
        "severity_level": "moderate",
        "image_sample": "https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Hibiscus Healthy",
        "crop": "Hibiscus",
        "scientific_name": "Hibiscus rosa-sinensis",
        "description": "Vibrant hibiscus bush with dark green glossy leaves and strong vegetative vigor.",
        "symptoms": "Glossy green leaves with serrated tips and no leaf yellowing or dark spots.",
        "organic_treatment": "Apply vermicompost and potassium-rich organic fertilizer to encourage continuous blooms.",
        "chemical_treatment": "None required.",
        "prevention_tips": "Ensure well-draining potting mix and full sunlight.",
        "severity_level": "healthy",
        "image_sample": "https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Neem Foliar Blight",
        "crop": "Neem",
        "scientific_name": "Pseudocercospora subsessilis",
        "description": "Foliar blight affecting neem trees, causing shot-holes and defoliation during prolonged monsoon rains.",
        "symptoms": "Circular or angular greyish-brown spots that dry out, leaving shot-holes in the leaflets.",
        "organic_treatment": "Neem is naturally hardy. Prune heavily infested branchlets and spray bio-agents.",
        "chemical_treatment": "Mancozeb foliar spray during persistent damp conditions.",
        "prevention_tips": "Ensure open spacing and adequate soil drainage.",
        "severity_level": "mild",
        "image_sample": "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Neem Healthy",
        "crop": "Neem",
        "scientific_name": "Azadirachta indica",
        "description": "Resilient, dark green compound leaves of neem displaying natural insect-resistant properties.",
        "symptoms": "Intact pinnate leaves, dark emerald green color, no browning or defoliation.",
        "organic_treatment": "Requires minimal fertilizer; drought tolerant.",
        "chemical_treatment": "None required.",
        "prevention_tips": "Plant in sunny locations with good drainage.",
        "severity_level": "healthy",
        "image_sample": "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Banana Sigatoka Leaf Spot",
        "crop": "Banana",
        "scientific_name": "Pseudocercospora musae",
        "description": "Yellow Sigatoka is a major foliar pathogen of bananas that reduces functional photosynthetic leaf area.",
        "symptoms": "Tiny yellowish-green specks that elongate into reddish-brown streaks with grey centers and yellow halos.",
        "organic_treatment": "De-leaf (surgically prune) infected leaf tips. Apply mineral oil and copper fungicides.",
        "chemical_treatment": "Rotate systemic fungicides (triazoles, strobilurins) mixed with petroleum spray oil.",
        "prevention_tips": "Plant at recommended spacing and maintain weed-free plantation floor.",
        "severity_level": "severe",
        "image_sample": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Banana Healthy",
        "crop": "Banana",
        "scientific_name": "Musa acuminata",
        "description": "Massive, vibrant green arching banana fronds without leaf streaks or marginal scorch.",
        "symptoms": "Broad, intact green leaf blades with strong central midrib.",
        "organic_treatment": "Heavy mulch with banana pseudostem residues and organic potash application.",
        "chemical_treatment": "None required.",
        "prevention_tips": "Ensure generous irrigation and wind protection.",
        "severity_level": "healthy",
        "image_sample": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Tomato Timber Rot / Stem Blight",
        "crop": "Tomato",
        "plant_part": "stem",
        "scientific_name": "Sclerotinia sclerotiorum",
        "description": "Stem rot disease that attacks tomato stalks at or near the soil line, causing sudden plant collapse.",
        "symptoms": "Water-soaked lesions on stems that bleach into chalky white cankers. Hard black resting bodies (sclerotia) form inside hollowed stems.",
        "organic_treatment": "Remove and incinerate infected vines. Drench surrounding soil with Coniothyrium minitans bio-fungicide.",
        "chemical_treatment": "Apply boscalid, fluopyram, or thiophanate-methyl targeted stem sprays.",
        "prevention_tips": "Ensure open canopy spacing for rapid drying, avoid mechanical stem wounds, and rotate with non-host grass crops.",
        "severity_level": "severe",
        "image_sample": "https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Tomato Healthy Stem",
        "crop": "Tomato",
        "plant_part": "stem",
        "scientific_name": "Solanum lycopersicum",
        "description": "Sturdy, fibrous green tomato vine with thick cambium and active vascular sap translocation.",
        "symptoms": "Firm epidermis, dense glandular trichomes, no cankers, splits, or fungal sclerotia.",
        "organic_treatment": "Provide sturdy trellising and calcium-rich bone meal to maintain strong stalk cell walls.",
        "chemical_treatment": "None required.",
        "prevention_tips": "Stake plants properly to keep stems off moist soil.",
        "severity_level": "healthy",
        "image_sample": "https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Corn Stalk Rot",
        "crop": "Corn",
        "plant_part": "stem",
        "scientific_name": "Colletotrichum graminicola / Gibberella zeae",
        "description": "Devastating stalk disease that disintegrates internal stalk pith, causing high lodging and mechanical harvest losses.",
        "symptoms": "Dark brown to black shiny streaks on lower stalk internodes. Inner pith decomposes into shredded, discolored vascular strands.",
        "organic_treatment": "Ensure balanced soil potassium levels which significantly strengthen stalk rind tissue.",
        "chemical_treatment": "Fungicide sprays applied at tassel stage reduce late-season stalk rot vulnerability.",
        "prevention_tips": "Select stalk rot-resistant hybrids and avoid excessively high plant density.",
        "severity_level": "severe",
        "image_sample": "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Potato Black Dot Root Rot",
        "crop": "Potato",
        "plant_part": "root",
        "scientific_name": "Colletotrichum coccodes",
        "description": "Root and stolon disease causing root rot, early dying, and unmarketable blemished tubers.",
        "symptoms": "Amethyst to brown root lesions dotted with minute black sclerotia (dots). Feeder roots decay and detach easily.",
        "organic_treatment": "Incorporate green manure crops like mustard to bio-fumigate soil before planting.",
        "chemical_treatment": "Apply azoxystrobin in-furrow at planting.",
        "prevention_tips": "Practice minimum 4-year crop rotations and avoid fields with compaction or standing water.",
        "severity_level": "moderate",
        "image_sample": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Potato Healthy Root System",
        "crop": "Potato",
        "plant_part": "root",
        "scientific_name": "Solanum tuberosum",
        "description": "Vigorous, fibrous potato root system and healthy stolons actively transferring starch to bulking tubers.",
        "symptoms": "Pristine creamy-white feeder roots, firm stolons, no dark sloughing cortex or lesions.",
        "organic_treatment": "Maintain well-drained loamy soil enriched with compost and beneficial mycorrhizae.",
        "chemical_treatment": "None required.",
        "prevention_tips": "Ensure deep hilling and maintain consistent soil moisture.",
        "severity_level": "healthy",
        "image_sample": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Tomato Root Knot Nematode",
        "crop": "Tomato",
        "plant_part": "root",
        "scientific_name": "Meloidogyne incognita",
        "description": "Microscopic parasitic roundworms that enter roots and induce large cellular galls, choking off water and nutrient flow.",
        "symptoms": "Irregular swollen galls and knots throughout the root architecture. Stunted above-ground growth and midday wilting.",
        "organic_treatment": "Apply neem cake soil amendments and bio-nematicides containing Purpureocillium lilacinum.",
        "chemical_treatment": "Apply registered non-fumigant nematicides (e.g., fluopyram) at transplanting.",
        "prevention_tips": "Plant nematode-resistant tomato varieties (designated with 'VFN') and rotate with marigolds.",
        "severity_level": "severe",
        "image_sample": "https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "General Plant Stem Canker",
        "crop": "General Plant",
        "plant_part": "stem",
        "scientific_name": "Botryosphaeria / Sclerotinia spp.",
        "description": "Stem canker infection causing localized tissue death on stems, stalks, and woody branches.",
        "symptoms": "Dark sunken elliptical lesions, bark cracking, and wilting of shoots above the canker.",
        "organic_treatment": "Prune infected stems at least 3 inches below the canker into healthy tissue. Disinfect shears with 70% alcohol.",
        "chemical_treatment": "Apply copper-based protectant fungicide to pruning wounds.",
        "prevention_tips": "Avoid trunk and stem injuries from weed-whackers and maintain plant vigor.",
        "severity_level": "moderate",
        "image_sample": "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "General Plant Root Rot",
        "crop": "General Plant",
        "plant_part": "root",
        "scientific_name": "Pythium / Phytophthora / Rhizoctonia spp.",
        "description": "Soil-borne water mold pathogens attacking root systems in overwatered or poorly drained soils.",
        "symptoms": "Roots turn brown, soft, and mushy with a foul sour odor. Above-ground foliage turns yellow and wilts despite moist soil.",
        "organic_treatment": "Drench soil with beneficial antagonistic fungi (Trichoderma harzianum) and reduce watering immediately.",
        "chemical_treatment": "Apply systemic root drench fungicides (e.g., Mefenoxam or Fosetyl-Al).",
        "prevention_tips": "Always use well-draining soil and ensure containers have ample drainage holes.",
        "severity_level": "severe",
        "image_sample": "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&auto=format&fit=crop&q=80"
    }
]

class Command(BaseCommand):
    help = "Seeds the database with comprehensive plant diseases, symptoms, treatments, and prevention tips across plant parts."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding plant diseases encyclopedia..."))
        created_count = 0
        updated_count = 0

        for data in DISEASES_DATA:
            if 'plant_part' not in data:
                data['plant_part'] = 'leaf'

            obj, created = Disease.objects.update_or_create(
                name=data['name'],
                defaults=data
            )
            if created:
                created_count += 1
            else:
                updated_count += 1

        self.stdout.write(self.style.SUCCESS(
            f"Successfully seeded database! ({created_count} created, {updated_count} updated, total {Disease.objects.count()} diseases)"
        ))
