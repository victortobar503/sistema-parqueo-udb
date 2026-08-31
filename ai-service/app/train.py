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
import json
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

from generate_data import generar_dataset

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
REAL_DATA_PATH = os.path.join(DATA_DIR, "historico_real.csv")
SYNTHETIC_DATA_PATH = os.path.join(DATA_DIR, "historico_simulado.csv")
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "parking_model.pkl")


def cargar_datos() -> pd.DataFrame:
    """
    Prioriza datos REALES (descargados de Firebase con
    fetch_firebase_data.py) si existen. Si no, usa/genera datos
    sintéticos. Así el mismo pipeline sirve para ambos casos: basta
    con correr fetch_firebase_data.py para que el modelo empiece a
    entrenar con datos reales.
    """
    if os.path.exists(REAL_DATA_PATH):
        print(f"Usando datos REALES: {REAL_DATA_PATH}")
        return pd.read_csv(REAL_DATA_PATH)

    print(f"No hay datos reales todavía ({REAL_DATA_PATH} no existe).")
    print("Usando datos SINTÉTICOS. Corre fetch_firebase_data.py para usar datos reales.")

    if os.path.exists(SYNTHETIC_DATA_PATH):
        return pd.read_csv(SYNTHETIC_DATA_PATH)
    df = generar_dataset()
    os.makedirs(DATA_DIR, exist_ok=True)
    df.to_csv(SYNTHETIC_DATA_PATH, index=False)
    return df


def entrenar():
    df = cargar_datos()

    X = df[["zona", "dia_semana", "hora"]]
    y = df["prob_ocupado"]

    n_filas = len(df)
    print(f"Filas de entrenamiento disponibles: {n_filas}")

    # Con muy pocas filas (ej: datos reales muy tempranos, con poca
    # variedad de día/hora todavía) no tiene sentido separar train/test:
    # entrenamos con todo y reportamos error sobre el mismo set, dejando
    # claro que es una métrica preliminar, no una evaluación robusta.
    if n_filas < 15:
        print(
            f"AVISO: solo hay {n_filas} filas (combinaciones zona/día/hora). "
            "Es muy poco para separar datos de prueba de forma confiable. "
            "Entrenando con TODO el dataset; el MAE/R² reportado es sobre "
            "los mismos datos de entrenamiento (optimista, no una evaluación real). "
            "Con más lecturas históricas en Firestore, esto mejora automáticamente."
        )
        X_train, X_test, y_train, y_test = X, X, y, y
    else:
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

    # Guarda metadata sobre CÓMO se entrenó este modelo (de dónde
    # salieron los datos), para que la API pueda reportarlo con
    # honestidad en vez de un texto fijo en el código.
    fuente = "real (Firestore)" if os.path.exists(REAL_DATA_PATH) else "sintético"
    info = {
        "algoritmo": "RandomForestRegressor",
        "fuente_datos": fuente,
        "filas_entrenamiento": n_filas,
        "mae": round(float(mae), 4),
        "r2": None if pd.isna(r2) else round(float(r2), 4),
    }
    info_path = os.path.join(os.path.dirname(MODEL_PATH), "model_info.json")
    with open(info_path, "w", encoding="utf-8") as f:
        json.dump(info, f, ensure_ascii=False, indent=2)
    print(f"Info del modelo guardada en: {info_path}")

    return modelo, mae, r2


if __name__ == "__main__":
    entrenar()
