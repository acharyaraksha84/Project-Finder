import numpy as np
import pickle
import warnings
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.linear_model import LogisticRegression

#To ignore warnings
warnings.filterwarnings("ignore")

print("\n==================================")
print("      TRAINING ML MODEL")
print("==================================\n")

X = np.array([
    [120, 10, 200, 3],
    [50, 2, 150, 2],
    [900, 100, 400, 5],
    [20, 1, 80, 1],
    [500, 40, 350, 4],
    [10, 1, 50, 1],
])

y = np.array([
    1, 0, 2, 0, 2, 0     # 0 = easy, 1 = intermediate, 2 = advanced
])

#Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42
)

#Train the model
model = LogisticRegression(max_iter=200)
model.fit(X_train, y_train)

#Predict and evaluate
y_pred = model.predict(X_test)
acc = accuracy_score(y_test, y_pred)

#Display results
print(f"🔹 Accuracy: {acc*100:.2f}%\n")

print("🔹 Classification Report:\n")
print(classification_report(y_test, y_pred))

print("🔹 Confusion Matrix:\n")
print(confusion_matrix(y_test, y_pred), "\n")

#Save the model
with open("difficulty_model.pkl", "wb") as f:
    pickle.dump(model, f)

print("==================================")
print("  MODEL SAVED: difficulty_model.pkl")
print("==================================\n")
