"""
Script to initialize and export MobileNetV2 architecture with pretrained ImageNet weights
and custom classification head into plant_disease_mobilenetv2.keras and .h5
"""
import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

from ml_engine.model_definition import create_mobilenetv2_model
from ml_engine.predictor import load_classes, MODEL_KERAS_PATH, MODEL_H5_PATH

def export_initial_model():
    print("Initializing MobileNetV2 with ImageNet weights and transfer learning head...")
    classes = load_classes()
    num_classes = len(classes) if classes else 25
    print(f"Configuring output layer for {num_classes} plant disease classes...")

    model = create_mobilenetv2_model(num_classes=num_classes)

    keras_path = str(MODEL_KERAS_PATH)
    h5_path = str(MODEL_H5_PATH)
    print(f"Saving model to {keras_path} and {h5_path}...")
    model.save(keras_path)
    model.save(h5_path)
    print("Model successfully generated and saved!")

if __name__ == '__main__':
    export_initial_model()
