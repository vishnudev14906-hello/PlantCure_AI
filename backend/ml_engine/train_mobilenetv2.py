"""
PlantCure AI - MobileNetV2 Transfer Learning Training Script
Fine-tunes MobileNetV2 on the PlantVillage Dataset for Plant Disease Classification.

Usage:
    python train_mobilenetv2.py --data_dir /path/to/plantvillage_dataset --epochs 15 --batch_size 32
"""

import os
import argparse
import json
from pathlib import Path

def train(data_dir, epochs=15, batch_size=32, learning_rate=1e-4, output_model='plant_disease_mobilenetv2.h5'):
    import tensorflow as tf
    from tensorflow.keras import layers, models, callbacks
    from tensorflow.keras.preprocessing.image import ImageDataGenerator
    from model_definition import create_mobilenetv2_model

    print(f"=== Starting MobileNetV2 Transfer Learning Training ===")
    print(f"TensorFlow version: {tf.__version__}")
    print(f"Dataset path: {data_dir}")

    # Data Augmentation & Normalization
    train_datagen = ImageDataGenerator(
        preprocessing_function=tf.keras.applications.mobilenet_v2.preprocess_input,
        rotation_range=25,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        fill_mode='nearest',
        validation_split=0.2
    )

    train_generator = train_datagen.flow_from_directory(
        data_dir,
        target_size=(224, 224),
        batch_size=batch_size,
        class_mode='categorical',
        subset='training'
    )

    val_generator = train_datagen.flow_from_directory(
        data_dir,
        target_size=(224, 224),
        batch_size=batch_size,
        class_mode='categorical',
        subset='validation'
    )

    num_classes = train_generator.num_classes
    print(f"Detected {num_classes} classes.")

    # Save class indices
    class_indices_map = {}
    for class_name, idx in train_generator.class_indices.items():
        parts = class_name.split('___')
        crop = parts[0].replace('_', ' ')
        disease = parts[1].replace('_', ' ') if len(parts) > 1 else 'Healthy'
        healthy = 'healthy' in class_name.lower()
        class_indices_map[idx] = {
            "raw": class_name,
            "crop": crop,
            "disease": disease,
            "healthy": healthy
        }

    with open('class_indices.json', 'w', encoding='utf-8') as f:
        json.dump(class_indices_map, f, indent=2)
    print("Exported class_indices.json")

    # Step 1: Feature Extraction
    print("Stage 1: Training top classification layers with frozen base...")
    model = create_mobilenetv2_model(num_classes=num_classes)

    cb = [
        callbacks.EarlyStopping(monitor='val_accuracy', patience=4, restore_best_weights=True),
        callbacks.ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=2, min_lr=1e-6),
        callbacks.ModelCheckpoint(output_model, monitor='val_accuracy', save_best_only=True)
    ]

    model.fit(
        train_generator,
        epochs=epochs,
        validation_data=val_generator,
        callbacks=cb
    )

    # Step 2: Fine-Tuning top 30 layers of base MobileNetV2
    print("Stage 2: Fine-tuning top layers of MobileNetV2...")
    base_mobilenet = model.layers[2]  # base MobileNetV2
    base_mobilenet.trainable = True
    for layer in base_mobilenet.layers[:-30]:
        layer.trainable = False

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=learning_rate),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )

    model.fit(
        train_generator,
        epochs=epochs // 2,
        validation_data=val_generator,
        callbacks=cb
    )

    # Final save
    model.save(output_model)
    print(f"Training complete! Model successfully saved to {output_model}")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Train MobileNetV2 on PlantVillage dataset")
    parser.add_argument('--data_dir', type=str, default='dataset/plantvillage', help='Path to dataset')
    parser.add_argument('--epochs', type=int, default=10, help='Number of epochs')
    parser.add_argument('--batch_size', type=int, default=32, help='Batch size')
    parser.add_argument('--output_model', type=str, default='plant_disease_mobilenetv2.h5', help='Output .h5 file')
    args = parser.parse_args()

    if os.path.exists(args.data_dir):
        train(args.data_dir, args.epochs, args.batch_size, output_model=args.output_model)
    else:
        print(f"Dataset directory '{args.data_dir}' not found.")
        print("To train on your own data, place the PlantVillage dataset folders into 'dataset/plantvillage' and rerun.")
