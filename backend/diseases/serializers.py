from rest_framework import serializers
from .models import Disease, ScanHistory

class DiseaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Disease
        fields = [
            'id',
            'name',
            'crop',
            'plant_part',
            'scientific_name',
            'description',
            'symptoms',
            'organic_treatment',
            'chemical_treatment',
            'prevention_tips',
            'severity_level',
            'image_sample',
            'created_at'
        ]


class ScanHistorySerializer(serializers.ModelSerializer):
    disease_details = DiseaseSerializer(source='disease', read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ScanHistory
        fields = [
            'id',
            'image',
            'image_url',
            'disease',
            'disease_details',
            'predicted_disease_name',
            'crop',
            'scientific_name',
            'detected_plant_part',
            'is_valid_plant_image',
            'confidence',
            'is_healthy',
            'notes',
            'timestamp'
        ]
        read_only_fields = ['id', 'timestamp']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None
