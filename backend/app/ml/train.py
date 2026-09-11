import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

df = pd.read_csv("dataset.csv")

X = df.drop("wait_time", axis=1)
y = df["wait_time"]

categorical_features = ["crop_type"]

preprocessor = ColumnTransformer(
    transformers=[
        ("crop", OneHotEncoder(handle_unknown="ignore"), categorical_features)
    ],
    remainder="passthrough"
)

model = RandomForestRegressor(
    n_estimators=100,
    random_state=42
)

pipeline = Pipeline([
    ("preprocessor", preprocessor),
    ("model", model)
])

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

pipeline.fit(X_train, y_train)

predictions = pipeline.predict(X_test)

mae = mean_absolute_error(y_test, predictions)
rmse = mean_squared_error(y_test, predictions) ** 0.5
r2 = r2_score(y_test, predictions)

print("Model trained successfully!")
print("MAE:", mae)
print("RMSE:", rmse)
print("R2 Score:", r2)

joblib.dump(pipeline, "model.pkl")

print("Model saved as model.pkl")