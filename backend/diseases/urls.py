from django.urls import path
from .views import (
    DiseaseListView,
    DiseaseDetailView,
    PredictDiseaseView,
    ScanHistoryListView,
    ScanHistoryDetailView,
    AIStatusConfigView
)

urlpatterns = [
    path('diseases/', DiseaseListView.as_view(), name='disease_list'),
    path('diseases/<int:pk>/', DiseaseDetailView.as_view(), name='disease_detail'),
    path('predict/', PredictDiseaseView.as_view(), name='predict_disease'),
    path('history/', ScanHistoryListView.as_view(), name='scan_history_list'),
    path('history/<int:pk>/', ScanHistoryDetailView.as_view(), name='scan_history_detail'),
    path('config/ai-status/', AIStatusConfigView.as_view(), name='ai_status'),
]

