from django.core.management.base import BaseCommand
from diseases.models import PlantTaxonomy

PLANT_TAXONOMY_RECORDS = [
    {
        "species_name": "Woody Tree",
        "plant_category": "tree",
        "typical_parts_available": ["root", "stem", "leaf", "flower", "fruit", "seed"],
        "scientific_name": "Arbor Lignosa",
        "tamil_name": "மர தண்டு மற்றும் வேர் பகுதி",
        "growth_habit": "Woody Perennial Tree (மரம்)"
    },
    {
        "species_name": "Tree Root",
        "plant_category": "tree",
        "typical_parts_available": ["root", "stem"],
        "scientific_name": "Arbor Radix (Tree Root System)",
        "tamil_name": "மர வேர் அமைப்பு",
        "growth_habit": "Woody Tree Root System (மர வேர்)"
    },
    {
        "species_name": "Rose",
        "plant_category": "shrub",
        "typical_parts_available": ["flower", "leaf", "stem", "fruit"],
        "scientific_name": "Rosa damascena",
        "tamil_name": "ரோஜா",
        "growth_habit": "Ornamental Flowering Shrub (புதர்ச்செடி)"
    },
    {
        "species_name": "Tomato",
        "plant_category": "herb",
        "typical_parts_available": ["leaf", "stem", "flower", "fruit", "seed"],
        "scientific_name": "Solanum lycopersicum",
        "tamil_name": "தக்காளி",
        "growth_habit": "Herbaceous Annual Crop (செடி)"
    },
    {
        "species_name": "Potato",
        "plant_category": "herb",
        "typical_parts_available": ["root", "leaf", "stem", "flower", "fruit", "seed"],
        "scientific_name": "Solanum tuberosum",
        "tamil_name": "உருளைக்கிழங்கு",
        "growth_habit": "Herbaceous Tuber Crop (கிழங்கு)"
    },
    {
        "species_name": "Corn",
        "plant_category": "grass",
        "typical_parts_available": ["leaf", "stem", "flower", "fruit", "seed"],
        "scientific_name": "Zea mays",
        "tamil_name": "மக்காச்சோளம்",
        "growth_habit": "Annual Cereal Grass (தானியம்)"
    },
    {
        "species_name": "Apple",
        "plant_category": "tree",
        "typical_parts_available": ["root", "stem", "leaf", "flower", "fruit", "seed"],
        "scientific_name": "Malus domestica",
        "tamil_name": "ஆப்பிள் மரம்",
        "growth_habit": "Deciduous Fruit Tree (மரம்)"
    },
    {
        "species_name": "Grape",
        "plant_category": "climber",
        "typical_parts_available": ["leaf", "stem", "fruit", "seed"],
        "scientific_name": "Vitis vinifera",
        "tamil_name": "திராட்சை",
        "growth_habit": "Woody Climbing Vine (கொடி)"
    },
    {
        "species_name": "Mango",
        "plant_category": "tree",
        "typical_parts_available": ["root", "stem", "leaf", "flower", "fruit", "seed"],
        "scientific_name": "Mangifera indica",
        "tamil_name": "மா மரம்",
        "growth_habit": "Broadleaf Evergreen Tree (மரம்)"
    },
    {
        "species_name": "Neem",
        "plant_category": "tree",
        "typical_parts_available": ["root", "stem", "leaf", "flower", "fruit", "seed"],
        "scientific_name": "Azadirachta indica",
        "tamil_name": "வேப்ப மரம்",
        "growth_habit": "Evergreen Medicinal Tree (மரம்)"
    },
    {
        "species_name": "Banana",
        "plant_category": "herb",
        "typical_parts_available": ["leaf", "stem", "flower", "fruit"],
        "scientific_name": "Musa acuminata",
        "tamil_name": "வாழை",
        "growth_habit": "Herbaceous Perennial Giant Herb (வாழை)"
    },
    {
        "species_name": "Hibiscus",
        "plant_category": "shrub",
        "typical_parts_available": ["flower", "leaf", "stem"],
        "scientific_name": "Hibiscus rosa-sinensis",
        "tamil_name": "செம்பருத்தி",
        "growth_habit": "Tropical Flowering Shrub (புதர்ச்செடி)"
    },
    {
        "species_name": "Jasmine",
        "plant_category": "shrub",
        "typical_parts_available": ["flower", "leaf", "stem"],
        "scientific_name": "Jasminum sambac",
        "tamil_name": "மல்லிகை",
        "growth_habit": "Evergreen Flowering Shrub / Scrambler (புதர்)"
    },
    {
        "species_name": "Tulsi",
        "plant_category": "herb",
        "typical_parts_available": ["leaf", "stem", "flower", "seed"],
        "scientific_name": "Ocimum tenuiflorum",
        "tamil_name": "துளசி",
        "growth_habit": "Aromatic Medicinal Herb (மூலிகை)"
    },
    {
        "species_name": "Bell Pepper",
        "plant_category": "herb",
        "typical_parts_available": ["leaf", "stem", "flower", "fruit", "seed"],
        "scientific_name": "Capsicum annuum",
        "tamil_name": "குடைமிளகாய்",
        "growth_habit": "Herbaceous Annual (பயிர்)"
    },
    {
        "species_name": "Chili",
        "plant_category": "herb",
        "typical_parts_available": ["leaf", "stem", "flower", "fruit", "seed"],
        "scientific_name": "Capsicum frutescens",
        "tamil_name": "பச்சை மிளகாய்",
        "growth_habit": "Herbaceous Annual (பயிர்)"
    },
    {
        "species_name": "Curry Leaf",
        "plant_category": "shrub",
        "typical_parts_available": ["leaf", "stem", "flower", "fruit", "seed"],
        "scientific_name": "Murraya koenigii",
        "tamil_name": "கறிவேப்பிலை",
        "growth_habit": "Subtropical Shrub / Small Tree (சிறு மரம்)"
    },
    {
        "species_name": "Guava",
        "plant_category": "tree",
        "typical_parts_available": ["root", "stem", "leaf", "flower", "fruit", "seed"],
        "scientific_name": "Psidium guajava",
        "tamil_name": "கொய்யா மரம்",
        "growth_habit": "Small Tropical Fruit Tree (மரம்)"
    },
    {
        "species_name": "Coconut",
        "plant_category": "tree",
        "typical_parts_available": ["root", "stem", "leaf", "flower", "fruit", "seed"],
        "scientific_name": "Cocos nucifera",
        "tamil_name": "தென்னை மரம்",
        "growth_habit": "Unbranched Palm Tree (மரம்)"
    },
    {
        "species_name": "Aloe Vera",
        "plant_category": "succulent",
        "typical_parts_available": ["leaf", "flower"],
        "scientific_name": "Aloe barbadensis miller",
        "tamil_name": "சோற்றுக்கற்றாழை",
        "growth_habit": "Succulent Xerophyte (கற்றாழை)"
    },
    {
        "species_name": "Money Plant",
        "plant_category": "climber",
        "typical_parts_available": ["leaf", "stem"],
        "scientific_name": "Epipremnum aureum",
        "tamil_name": "மணி பிளான்ட்",
        "growth_habit": "Evergreen Foliar Vine (கொடி)"
    },
    {
        "species_name": "Wheat",
        "plant_category": "grass",
        "typical_parts_available": ["leaf", "stem", "flower", "seed"],
        "scientific_name": "Triticum aestivum",
        "tamil_name": "கோதுமை",
        "growth_habit": "Cereal Grass (தானியம்)"
    },
    {
        "species_name": "Rice",
        "plant_category": "grass",
        "typical_parts_available": ["leaf", "stem", "flower", "seed"],
        "scientific_name": "Oryza sativa",
        "tamil_name": "நெல்",
        "growth_habit": "Cereal Wetland Grass (தானியம்)"
    },
    {
        "species_name": "Soybean",
        "plant_category": "herb",
        "typical_parts_available": ["leaf", "stem", "flower", "fruit", "seed"],
        "scientific_name": "Glycine max",
        "tamil_name": "சோயாபீன்",
        "growth_habit": "Leguminous Annual Herb (பருப்பு வகை)"
    },
    {
        "species_name": "Cotton",
        "plant_category": "shrub",
        "typical_parts_available": ["leaf", "stem", "flower", "fruit", "seed"],
        "scientific_name": "Gossypium hirsutum",
        "tamil_name": "பருத்தி",
        "growth_habit": "Fiber Shrub (பருத்தி செடி)"
    },
    {
        "species_name": "Coffee",
        "plant_category": "shrub",
        "typical_parts_available": ["leaf", "stem", "flower", "fruit", "seed"],
        "scientific_name": "Coffea arabica",
        "tamil_name": "காபி",
        "growth_habit": "Evergreen Understory Shrub (காபி செடி)"
    },
    {
        "species_name": "Tea",
        "plant_category": "shrub",
        "typical_parts_available": ["leaf", "stem", "flower", "seed"],
        "scientific_name": "Camellia sinensis",
        "tamil_name": "தேயிலை",
        "growth_habit": "Montane Shrub (தேயிலை செடி)"
    },
    {
        "species_name": "General Plant",
        "plant_category": "herb",
        "typical_parts_available": ["root", "stem", "leaf", "flower", "fruit", "seed"],
        "scientific_name": "Plantae (Botanical Specimen)",
        "tamil_name": "பொது தாவர மாதிரி",
        "growth_habit": "Botanical Specimen (தாவரம்)"
    }
]

class Command(BaseCommand):
    help = "Seeds the PlantTaxonomy reference table with biologically consistent plant species data."

    def handle(self, *args, **options):
        count = 0
        for item in PLANT_TAXONOMY_RECORDS:
            obj, created = PlantTaxonomy.objects.update_or_create(
                species_name=item["species_name"],
                defaults={
                    "plant_category": item["plant_category"],
                    "typical_parts_available": item["typical_parts_available"],
                    "scientific_name": item["scientific_name"],
                    "tamil_name": item["tamil_name"],
                    "growth_habit": item["growth_habit"],
                }
            )
            count += 1
        self.stdout.write(self.style.SUCCESS(f"Successfully seeded {count} PlantTaxonomy records into SQLite."))
