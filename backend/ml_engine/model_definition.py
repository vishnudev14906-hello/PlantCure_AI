"""
MobileNetV2 Transfer Learning Architecture for Plant Disease Classification.
"""

def create_mobilenetv2_model(num_classes=25, input_shape=(224, 224, 3)):
    """
    Constructs a MobileNetV2 Transfer Learning model with Keras 3 native Rescaling layer.
    Base model uses weights pretrained on ImageNet, with a custom classification head.
    """
    import tensorflow as tf
    from tensorflow.keras import layers, models

    # Load MobileNetV2 backbone pretrained on ImageNet
    base_model = tf.keras.applications.MobileNetV2(
        input_shape=input_shape,
        include_top=False,
        weights='imagenet'
    )
    base_model.trainable = False  # Freeze base layers for feature extraction

    inputs = tf.keras.Input(shape=input_shape, name="leaf_image_input")
    # Standard MobileNetV2 normalization [-1, 1] using standard Keras Rescaling layer
    x = layers.Rescaling(scale=1.0 / 127.5, offset=-1.0, name="mobilenet_rescaling")(inputs)
    x = base_model(x, training=False)
    x = layers.GlobalAveragePooling2D(name="global_pool")(x)
    x = layers.Dense(256, activation='relu', name="fc_dense_256")(x)
    x = layers.BatchNormalization(name="batch_norm")(x)
    x = layers.Dropout(0.3, name="head_dropout")(x)
    outputs = layers.Dense(num_classes, activation='softmax', dtype='float32', name="disease_predictions")(x)

    model = models.Model(inputs=inputs, outputs=outputs, name="PlantCure_MobileNetV2")

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )

    return model
