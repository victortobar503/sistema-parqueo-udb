"""
Entrena el modelo de IA que predice la probabilidad de que un parqueo
esté OCUPADO, dado: zona, día de la semana y hora.

Modelo: RandomForestRegressor (scikit-learn). Se eligió Random Forest
porque:
- Captura relaciones no lineales (picos de hora) sin necesitar mucho
  tuning.
- Es rápido de entrenar y de servir (ideal para un prototipo).
- Es fácil de explicar en la sustentación ("bosque de árboles de
  decisión que vota una probabilidad promedio").

Salida: ai-service/models/parking_model.pkl
"""

import os
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

from generate_data import generar_dataset

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "historico_simulado.csv")
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "parking_model.pkl")


def cargar_datos() -> pd.DataFrame:
    if os.path.exists(DATA_PATH):
        return pd.read_csv(DATA_PATH)
    df = generar_dataset()
    os.makedirs(os.path.dirname(DATA_PATH), exist_ok=True)
    df.to_csv(DATA_PATH, index=False)
    return df


def entrenar():
    df = cargar_datos()

    X = df[["zona", "dia_semana", "hora"]]
    y = df["prob_ocupado"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # 'zona' es categórica (A/B/C/D) -> One-Hot Encoding.
    # 'dia_semana' y 'hora' ya son numéricas -> pasan directo.
    preprocesador = ColumnTransformer(
        transformers=[
            ("zona_ohe", OneHotEncoder(handle_unknown="ignore"), ["zona"]),
        ],
        remainder="passthrough",
    )

    modelo = Pipeline(steps=[
        ("preprocesador", preprocesador),
        ("regresor", RandomForestRegressor(
            n_estimators=200,
            max_depth=8,
            random_state=42,
            n_jobs=-1,
        )),
    ])

    modelo.fit(X_train, y_train)

    y_pred = modelo.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)

    print(f"MAE  (error absoluto promedio): {mae:.4f}")
    print(f"R^2  (varianza explicada):      {r2:.4f}")

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(modelo, MODEL_PATH)
    print(f"Modelo guardado en: {MODEL_PATH}")

    return modelo, mae, r2


if __name__ == "__main__":
    entrenar()
