import numpy as np
import sys
import os
from keras.models import Model
from keras.layers import Dense, Dropout
from keras.applications.mobilenet import MobileNet, preprocess_input
from keras.preprocessing.image import load_img, img_to_array
from utils.score_utils import mean_score, std_score

def load_nima_model(weights_path):
    base_model = MobileNet((None, None, 3), include_top=False, pooling='avg', weights=None)
    x = Dropout(0.75)(base_model.output)
    x = Dense(10, activation='softmax')(x)
    model = Model(inputs=base_model.input, outputs=x)
    model.load_weights(weights_path)
    return model

def evaluate_image(image_path, model):
    img = load_img(image_path, target_size=(224, 224))
    x = img_to_array(img)
    x = np.expand_dims(x, axis=0)
    x = preprocess_input(x)
    scores = model.predict(x, verbose=0)[0]
    mean = mean_score(scores)
    std = std_score(scores)
    return mean, std

def main():
    if len(sys.argv) != 2:
        print("Usage: python run_nima.py <image_path>")
        sys.exit(1)

    image_path = sys.argv[1]

    # Get the directory where the current script is located
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

    # Construct absolute path to the weights file
    weights_path = os.path.join(BASE_DIR, 'model', 'mobilenet_weights.h5')

    model = load_nima_model(weights_path)
    mean_score_value, std_score_value = evaluate_image(image_path, model)

    # Only print the score, so Node.js can read it
    print(f"{mean_score_value:.2f},{std_score_value:.2f}")

if __name__ == "__main__":
    main()