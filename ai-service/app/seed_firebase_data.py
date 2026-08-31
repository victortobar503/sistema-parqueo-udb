"""
Siembra un historial de ocupación con variedad de día/hora en la
colección `historial_ocupacion` de Firestore.

Por qué existe este script: el equipo todavía no tiene meses de
lecturas reales de sensores, solo una carga de prueba de un momento
puntual. Para que el modelo de IA pueda aprender patrones de verdad
(horas pico, diferencias entre zonas) mientras llegan más lecturas
reales, este script genera un historial simulado -pero realista- y lo
inserta directamente en tu Firestore, usando los espacios reales que
ya existen en la colección `espacios` (no inventa IDs).

Los patrones (picos ~8am y ~1pm, menor actividad el sábado, etc.) son
los mismos que ya se usaban en generate_data.py para el modo 100%
sintético.

Uso:
    python seed_firebase_data.py
    python seed_firebase_data.py --credentials ruta/a/tu-key.json
    python seed_firebase_data.py --semanas 26   # cuántas semanas simular
"""

import argparse
import os
from datetime import datetime, timedelta

import firebase_admin
import numpy as np
from firebase_admin import credentials, firestore

DEFAULT_CREDENTIALS_PATH = os.path.join(
    os.path.dirname(__file__), "..", "firebase-credentials.json"
)

RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)

HORAS = [6, 8, 10, 12, 14, 16, 18]
DIAS = [0, 1, 2, 3, 4, 5]  # 0=Lunes ... 5=Sábado

# Perfil base de ocupación por zona (0=siempre libre, 1=siempre lleno).
# Si tu proyecto tiene zonas con vocación distinta (cafetín, biblioteca,
# etc.) puedes ajustar esto para que el patrón tenga sentido narrativo.
PERFIL_ZONA_DEFAULT = 0.6


def conectar_firestore(credentials_path: str):
    if not os.path.exists(credentials_path):
        raise FileNotFoundError(
            f"No encontré el archivo de credenciales en {credentials_path}."
        )
    cred = credentials.Certificate(credentials_path)
    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred)
    return firestore.client()


def obtener_espacios_reales(db) -> dict:
    """
    Lee la colección `espacios` y devuelve un dict:
    { "area_a": ["A01", "A02", ...], "area_b": [...], ... }
    usando los espacios que YA existen en tu base, no inventados.
    """
    docs = db.collection("espacios").stream()
    espacios_por_zona: dict[str, list[str]] = {}
    for doc in docs:
        d = doc.to_dict()
        area_id = d.get("areaId")
        if not area_id:
            continue
        espacios_por_zona.setdefault(area_id, []).append(doc.id)

    if not espacios_por_zona:
        raise ValueError(
            "No encontré documentos en la colección 'espacios'. "
            "Necesito al menos un espacio por zona para saber qué IDs usar."
        )
    return espacios_por_zona


def curva_hora_pico(hora: float) -> float:
    pico_manana = np.exp(-((hora - 8) ** 2) / (2 * 1.3 ** 2))
    pico_tarde = np.exp(-((hora - 13) ** 2) / (2 * 1.8 ** 2))
    base = 0.15
    factor = base + 0.55 * pico_manana + 0.45 * pico_tarde
    return float(np.clip(factor, 0, 1))


def factor_dia(dia_semana: int) -> float:
    factores = {0: 1.00, 1: 1.05, 2: 1.00, 3: 1.02, 4: 0.85, 5: 0.35}
    return factores.get(dia_semana, 1.0)


def generar_documentos(espacios_por_zona: dict, n_semanas: int):
    """
    Genera (sin escribir todavía) la lista de documentos a insertar en
    `historial_ocupacion`, con la MISMA estructura de campos que ya
    usa tu app: areaId, diaSemana, espacioId, estado, hora, timestamp.
    """
    ahora = datetime.now()
    documentos = []

    for area_id, espacios in espacios_por_zona.items():
        for semana in range(n_semanas):
            for dia in DIAS:
                for hora in HORAS:
                    prob_base = PERFIL_ZONA_DEFAULT * curva_hora_pico(hora) * factor_dia(dia)
                    ruido = np.random.normal(0, 0.05)
                    prob_ocupado = float(np.clip(prob_base + ruido, 0.02, 0.98))

                    # timestamp aproximado: hace (n_semanas - semana) semanas,
                    # en el día de la semana correspondiente.
                    dias_atras = (n_semanas - semana) * 7 + (5 - dia)
                    fecha = (ahora - timedelta(days=dias_atras)).replace(
                        hour=hora, minute=0, second=0, microsecond=0
                    )

                    for espacio_id in espacios:
                        ocupado = np.random.random() < prob_ocupado
                        documentos.append({
                            "areaId": area_id,
                            "diaSemana": dia,
                            "espacioId": espacio_id,
                            "estado": "ocupado" if ocupado else "libre",
                            "hora": hora,
                            "timestamp": fecha,
                        })

    return documentos


def escribir_en_lotes(db, documentos: list, tamano_lote: int = 450):
    """
    Firestore permite máximo 500 escrituras por batch; usamos 450 para
    quedar con margen.
    """
    coleccion = db.collection("historial_ocupacion")
    total = len(documentos)
    escritos = 0

    for i in range(0, total, tamano_lote):
        lote = db.batch()
        chunk = documentos[i:i + tamano_lote]
        for doc_data in chunk:
            ref = coleccion.document()
            lote.set(ref, doc_data)
        lote.commit()
        escritos += len(chunk)
        print(f"  {escritos}/{total} documentos escritos...")

    return escritos


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--credentials", default=DEFAULT_CREDENTIALS_PATH)
    parser.add_argument("--semanas", type=int, default=8)
    args = parser.parse_args()

    print(f"Conectando a Firestore con credenciales: {args.credentials}")
    db = conectar_firestore(args.credentials)

    print("Leyendo espacios reales de la colección 'espacios'...")
    espacios_por_zona = obtener_espacios_reales(db)
    for zona, espacios in espacios_por_zona.items():
        print(f"  {zona}: {len(espacios)} espacios ({', '.join(espacios)})")

    print(f"\nGenerando historial simulado de {args.semanas} semanas...")
    documentos = generar_documentos(espacios_por_zona, args.semanas)
    print(f"  {len(documentos)} documentos a insertar.")
    if len(documentos) > 18000:
        print(
            "  AVISO: esto se acerca al límite gratuito de ~20,000 escrituras/día "
            "de Firestore (plan Spark). Considera bajar --semanas si falla."
        )

    respuesta = input(
        f"\n¿Insertar estos {len(documentos)} documentos en tu Firestore real "
        f"(colección 'historial_ocupacion')? [s/N]: "
    )
    if respuesta.strip().lower() != "s":
        print("Cancelado, no se insertó nada.")
        return

    print("\nEscribiendo en Firestore...")
    escritos = escribir_en_lotes(db, documentos)
    print(f"\nListo: {escritos} documentos insertados en 'historial_ocupacion'.")
    print("Ahora corre: python fetch_firebase_data.py && python train.py")


if __name__ == "__main__":
    main()
