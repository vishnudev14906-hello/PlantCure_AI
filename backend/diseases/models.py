from django.db import models
from django.contrib.auth.models import User

class Disease(models.Model):
    SEVERITY_CHOICES = [
        ('healthy', 'Healthy (No Disease)'),
        ('mild', 'Mild Severity'),
        ('moderate', 'Moderate Severity'),
        ('severe', 'Severe / High Risk'),
    ]

    PLANT_PART_CHOICES = [
        ('leaf', 'Leaf / Foliage 🌿'),
        ('stem', 'Stem / Stalk / Vine 🎋'),
        ('root', 'Root / Tuber 🥕'),
        ('flower', 'Flower / Blossom 🌸'),
        ('fruit', 'Fruit / Pod 🍎'),
        ('seed', 'Seed / Grain / Kernel 🌰'),
        ('whole_plant', 'Whole Plant / General 🪴'),
    ]

    name = models.CharField(max_length=200, unique=True)
    crop = models.CharField(max_length=100)
    plant_part = models.CharField(max_length=50, choices=PLANT_PART_CHOICES, default='leaf', help_text="Target plant organ: leaf, stem, root, etc.")
    scientific_name = models.CharField(max_length=200, blank=True, default='')
    description = models.TextField()
    symptoms = models.TextField(help_text="Visible symptoms on foliage, stems, or fruit")
    organic_treatment = models.TextField(help_text="Organic, bio-friendly treatments")
    chemical_treatment = models.TextField(help_text="Conventional chemical treatments and fungicides")
    prevention_tips = models.TextField(help_text="Cultural and preventive farm practices")
    severity_level = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='moderate')
    image_sample = models.CharField(max_length=500, blank=True, default='', help_text="Sample image URL or filename")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['crop', 'plant_part', 'name']

    def __str__(self):
        return f"{self.crop} ({self.plant_part}) - {self.name}"


class ScanHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='scans')
    image = models.ImageField(upload_to='leaf_scans/')
    disease = models.ForeignKey(Disease, on_delete=models.SET_NULL, null=True, blank=True, related_name='scans')
    predicted_disease_name = models.CharField(max_length=200)
    crop = models.CharField(max_length=100, blank=True, default='')
    scientific_name = models.CharField(max_length=150, blank=True, default='', help_text="Botanical scientific name")
    detected_plant_part = models.CharField(max_length=50, default='leaf', help_text="Detected plant part: leaf, stem, root, flower, fruit, unknown")
    is_valid_plant_image = models.BooleanField(default=True, help_text="True if Stage 1 confirmed valid plant part")
    confidence = models.FloatField(help_text="Confidence percentage (0 - 100)")
    is_healthy = models.BooleanField(default=False)
    notes = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        status_tag = "Valid" if self.is_valid_plant_image else "Invalid"
        return f"Scan by {self.user.username}: [{status_tag}] {self.predicted_disease_name} ({self.confidence:.1f}%)"


class PlantTaxonomy(models.Model):
    """
    Taxonomy and biological consistency reference table.
    Ensures predictions respect real-world biological constraints (e.g. Rose is a shrub, not a tree;
    a tree root cannot be classified as a rose).
    """
    CATEGORY_CHOICES = [
        ('tree', 'Tree (மரம்)'),
        ('shrub', 'Shrub / Bush (புதர்ச்செடி)'),
        ('herb', 'Herb / Annual (மூலிகை / சிறுசெடி)'),
        ('climber', 'Climber / Vine / Creeper (கொடி)'),
        ('succulent', 'Succulent / Cactus (கற்றாழை)'),
        ('grass', 'Grass / Cereal (புல் / தானியம்)'),
    ]

    species_name = models.CharField(max_length=120, unique=True, db_index=True)
    plant_category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='herb')
    typical_parts_available = models.JSONField(
        default=list,
        help_text="List of biologically realistic plant parts (e.g. ['leaf', 'stem', 'flower', 'fruit', 'seed'])"
    )
    scientific_name = models.CharField(max_length=150, blank=True, default='')
    tamil_name = models.CharField(max_length=150, blank=True, default='')
    growth_habit = models.CharField(max_length=100, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['species_name']
        verbose_name = 'Plant Taxonomy'
        verbose_name_plural = 'Plant Taxonomies'

    def __str__(self):
        return f"{self.species_name} ({self.get_plant_category_display()})"


class PlantPartDiseaseMapping(models.Model):
    """
    Biological consistency rule mapping between plant organs and diseases.
    Ensures that a stem disease (e.g., Stem Canker) can NEVER be diagnosed on a fruit organ,
    and a fruit rot can never be diagnosed on a root.
    """
    disease_name = models.CharField(max_length=200, db_index=True)
    crop = models.CharField(max_length=100, db_index=True)
    valid_plant_part = models.CharField(max_length=50, choices=Disease.PLANT_PART_CHOICES, db_index=True)
    is_pathologically_valid = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['crop', 'valid_plant_part', 'disease_name']
        unique_together = ('disease_name', 'crop', 'valid_plant_part')
        verbose_name = 'Plant Part Disease Mapping'
        verbose_name_plural = 'Plant Part Disease Mappings'

    def __str__(self):
        return f"{self.crop} ({self.valid_plant_part}): {self.disease_name}"


class PredictionAuditLog(models.Model):
    """
    Inference audit trail logging raw vs calibrated confidence scores,
    intermediate pipeline stage results, and biological taxonomy sanity checks.
    """
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_logs')
    input_image_name = models.CharField(max_length=255, blank=True, default='')
    detected_plant_part = models.CharField(max_length=50)
    part_confidence_raw = models.FloatField(default=0.0)
    part_confidence_calibrated = models.FloatField(default=0.0)
    predicted_species = models.CharField(max_length=100)
    species_confidence_raw = models.FloatField(default=0.0)
    species_confidence_calibrated = models.FloatField(default=0.0)
    predicted_disease = models.CharField(max_length=200)
    disease_confidence_raw = models.FloatField(default=0.0)
    disease_confidence_calibrated = models.FloatField(default=0.0)
    final_confidence = models.FloatField(default=0.0)
    calibration_method = models.CharField(max_length=100, default='temperature_scaling')
    taxonomy_check_passed = models.BooleanField(default=True)
    correction_applied = models.BooleanField(default=False)
    correction_reason = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Prediction Audit Log'
        verbose_name_plural = 'Prediction Audit Logs'

    def __str__(self):
        return f"[{self.timestamp.strftime('%Y-%m-%d %H:%M:%S')}] {self.predicted_species} ({self.detected_plant_part}) -> {self.predicted_disease} ({self.final_confidence:.1f}%)"

