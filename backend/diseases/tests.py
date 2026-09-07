import io
from PIL import Image
from django.test import TestCase
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from rest_framework import status
from .models import Disease, ScanHistory

class DiseaseApiTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='botanist',
            email='botanist@example.com',
            password='Password123!'
        )
        self.disease = Disease.objects.create(
            name="Tomato Early Blight",
            crop="Tomato",
            scientific_name="Alternaria solani",
            description="Fungal pathogen targeting foliage.",
            symptoms="Target-like brown concentric rings.",
            organic_treatment="Copper fungicide and pruning.",
            chemical_treatment="Chlorothalonil spray.",
            prevention_tips="Crop rotation and drip irrigation.",
            severity_level="moderate"
        )

    def create_dummy_leaf_image(self):
        import numpy as np
        file = io.BytesIO()
        arr = np.zeros((224, 224, 3), dtype=np.uint8)
        # Foliar pattern with natural variation
        for y in range(224):
            for x in range(224):
                arr[y, x, 0] = int(35 + (x % 15))
                arr[y, x, 1] = int(140 + (y % 30))
                arr[y, x, 2] = int(35 + ((x + y) % 10))
        image = Image.fromarray(arr)
        image.save(file, 'jpeg')
        file.seek(0)
        return SimpleUploadedFile("leaf_test.jpg", file.read(), content_type="image/jpeg")

    def create_non_plant_image(self):
        file = io.BytesIO()
        # Non-plant pure blue image (sky or blue car)
        image = Image.new('RGB', (224, 224), color=(30, 80, 220))
        image.save(file, 'jpeg')
        file.seek(0)
        return SimpleUploadedFile("non_leaf.jpg", file.read(), content_type="image/jpeg")

    def test_disease_list_and_filter(self):
        resp = self.client.get('/api/diseases/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['count'], 1)
        self.assertEqual(resp.data['results'][0]['crop'], 'Tomato')

        # Filter by crop
        crop_resp = self.client.get('/api/diseases/?crop=Tomato')
        self.assertEqual(crop_resp.data['count'], 1)

        empty_resp = self.client.get('/api/diseases/?crop=Potato')
        self.assertEqual(empty_resp.data['count'], 0)

    def test_predict_endpoint_unauthenticated(self):
        image_file = self.create_dummy_leaf_image()
        response = self.client.post(
            '/api/predict/',
            {'image': image_file},
            format='multipart'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('confidence', response.data)
        self.assertIn('predicted_disease_name', response.data)
        self.assertIn('organic_treatment', response.data)
        self.assertIn('prevention_tips', response.data)
        self.assertTrue(len(response.data['organic_treatment']) > 0)

    def test_predict_endpoint_authenticated_records_scan(self):
        self.client.force_authenticate(user=self.user)
        image_file = self.create_dummy_leaf_image()
        response = self.client.post(
            '/api/predict/',
            {'image': image_file},
            format='multipart'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNotNone(response.data['scan_id'])

        # Verify scan is in user history
        history_resp = self.client.get('/api/history/')
        self.assertEqual(history_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(history_resp.data['count'], 1)
        self.assertEqual(history_resp.data['results'][0]['id'], response.data['scan_id'])

    def test_predict_endpoint_rejects_non_plant_image(self):
        non_plant_file = self.create_non_plant_image()
        response = self.client.post(
            '/api/predict/',
            {'image': non_plant_file},
            format='multipart'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data.get('is_valid_plant'), False)
        self.assertEqual(response.data.get('error_code'), 'NO_PLANT_PART_DETECTED')
        self.assertIn("plant part", response.data.get('detail', '').lower())

