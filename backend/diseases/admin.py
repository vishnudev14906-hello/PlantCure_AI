from django.contrib import admin
from .models import Disease, ScanHistory, PlantTaxonomy, PlantPartDiseaseMapping, PredictionAuditLog

@admin.register(Disease)
class DiseaseAdmin(admin.ModelAdmin):
    list_display = ('name', 'crop', 'plant_part', 'severity_level')
    list_filter = ('crop', 'plant_part', 'severity_level')
    search_fields = ('name', 'crop', 'scientific_name')

@admin.register(ScanHistory)
class ScanHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'predicted_disease_name', 'crop', 'detected_plant_part', 'confidence', 'is_healthy', 'timestamp')
    list_filter = ('detected_plant_part', 'is_healthy', 'is_valid_plant_image')
    search_fields = ('user__username', 'predicted_disease_name', 'crop')

@admin.register(PlantTaxonomy)
class PlantTaxonomyAdmin(admin.ModelAdmin):
    list_display = ('species_name', 'plant_category', 'scientific_name', 'growth_habit')
    list_filter = ('plant_category',)
    search_fields = ('species_name', 'scientific_name', 'tamil_name')

@admin.register(PlantPartDiseaseMapping)
class PlantPartDiseaseMappingAdmin(admin.ModelAdmin):
    list_display = ('crop', 'valid_plant_part', 'disease_name', 'is_pathologically_valid')
    list_filter = ('valid_plant_part', 'crop', 'is_pathologically_valid')
    search_fields = ('disease_name', 'crop')

@admin.register(PredictionAuditLog)
class PredictionAuditLogAdmin(admin.ModelAdmin):
    list_display = ('timestamp', 'predicted_species', 'detected_plant_part', 'predicted_disease', 'final_confidence', 'taxonomy_check_passed', 'correction_applied')
    list_filter = ('detected_plant_part', 'taxonomy_check_passed', 'correction_applied')
    search_fields = ('predicted_species', 'predicted_disease', 'input_image_name')


