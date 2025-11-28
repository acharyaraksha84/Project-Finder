import pickle
import numpy as np

# Load ML model
def load_model():
    with open("difficulty_model.pkl", "rb") as f:
        return pickle.load(f)

model = load_model()

# Predict difficulty level
def predict_difficulty_level(stars, issues, desc_len, tag_count):
    x = np.array([[stars, issues, desc_len, tag_count]])
    pred = model.predict(x)[0]

    if pred == 0:
        return "easy"
    elif pred == 1:
        return "intermediate"
    return "advanced"