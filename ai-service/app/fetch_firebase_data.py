"""
Descarga el historial REAL de ocupación desde Firestore (colección
`historial_ocupacion`) y lo convierte al mismo formato que usa
train.py, para entrenar el modelo con datos reales de los sensores
en vez de datos sintéticos.

Requiere un archivo de credenciales de cuenta de servicio de Firebase
(descargado desde Firebase Console > Project Settings > Service
Accounts > Generate new private key). Ese archivo NUNCA debe subirse
a Git (ver .gitignore).

Uso:
    python fetch_firebase_data.py
    # o con una ruta de credenciales distinta:
    python fetch_firebase_data.py --credentials ruta/a/tu-key.json
"""

import argparse
import os

import firebase_admin
import pandas as pd
from firebase_admin import credentials, firestore

# Mapea el id de documento de Firestore ("area_a") a la letra de zona
# que usa el resto del sistema ("A").
AREA_ID_A_ZONA = {
    "area_a": "A",
    "area_b": "B",
    "area_c": "C",
    "area_d": "D",
    "area_e": "E",
}

DEFAULT_CREDENTIALS_PATH = os.path.join(
    os.path.dirname(__file__), "..", "firebase-credentials.json"
)
OUTPUT_PATH = os.path.join(
    os.path.dirname(__file__), "..", "data", "historico_real.csv"
)


def conectar_firestore(credentials_path: str):
    if not os.path.exists(credentials_path):
        raise FileNotFoundError(
            f"No encontré el archivo de credenciales en {credentials_path}.\n"
            "Descárgalo desde Firebase Console > Project Settings > "
            "Service Accounts > Generate new private key, y colócalo ahí "
            "(o pasa la ruta con --credentials)."
        )
    cred = credentials.Certificate(credentials_path)
    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred)
    return firestore.client()


def descargar_historial(db) -> pd.DataFrame:
    """
    Lee todos los documentos de `historial_ocupacion` y los devuelve
    como filas crudas (una fila = una lectura de un espacio en un
    momento dado).
    """
    docs = db.collection("historial_ocupacion").stream()

    filas = []
    for doc in docs:
        d = doc.to_dict()
        area_id = d.get("areaId")
        zona = AREA_ID_A_ZONA.get(area_id)
        if zona is None:
            continue  # ignora documentos con areaId inesperado

        dia_semana = d.get("diaSemana")
        hora = d.get("hora")
        estado = d.get("estado")

        if dia_semana is None or hora is None or estado is None:
            continue

        filas.append({
            "zona": zona,
            "dia_semana": int(dia_semana),
            "hora": int(hora),
            "ocupado": 1 if estado == "ocupado" else 0,
        })

    if not filas:
        raise ValueError(
            "No se encontraron documentos válidos en 'historial_ocupacion'. "
            "Verifica que la colección tenga datos y que los campos se "
            "llamen areaId, diaSemana, hora y estado."
        )

    return pd.DataFrame(filas)


def agregar_a_formato_entrenamiento(df_crudo: pd.DataFrame) -> pd.DataFrame:
    """
    Agrupa las lecturas crudas por (zona, dia_semana, hora) y calcula
    la probabilidad observada de ocupación en ese bloque, en el mismo
    formato que espera train.py (columnas: zona, dia_semana, hora,
    capacidad, ocupados, prob_ocupado).
    """
    agrupado = (
        df_crudo.groupby(["zona", "dia_semana", "hora"])
        .agg(lecturas=("ocupado", "count"), ocupados=("ocupado", "sum"))
        .reset_index()
    )
    agrupado["capacidad"] = agrupado["lecturas"]
    agrupado["prob_ocupado"] = (agrupado["ocupados"] / agrupado["lecturas"]).round(3)

    return agrupado[["zona", "dia_semana", "hora", "capacidad", "ocupados", "prob_ocupado"]]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--credentials", default=DEFAULT_CREDENTIALS_PATH)
    args = parser.parse_args()

    print(f"Conectando a Firestore con credenciales: {args.credentials}")
    db = conectar_firestore(args.credentials)

    print("Descargando 'historial_ocupacion'...")
    df_crudo = descargar_historial(db)
    print(f"  {len(df_crudo)} lecturas descargadas.")

    df_entrenamiento = agregar_a_formato_entrenamiento(df_crudo)
    print(f"  {len(df_entrenamiento)} combinaciones zona/día/hora agregadas.")

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    df_entrenamiento.to_csv(OUTPUT_PATH, index=False)
    print(f"Guardado en: {OUTPUT_PATH}")
    print("\nAhora corre `python train.py` para reentrenar el modelo con estos datos reales.")

    print("\nVista previa:")
    print(df_entrenamiento.head(10))


if __name__ == "__main__":
    main()
