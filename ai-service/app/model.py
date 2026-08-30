import os
import joblib
import pandas as pd

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "parking_model.pkl")

DIAS_NOMBRE = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]


class ModeloOcupacion:
    """
    Envoltorio del modelo de ML: carga el .pkl entrenado (train.py) y
    expone métodos simples de predicción usados por la API.
    """

    def __init__(self, model_path: str = MODEL_PATH):
        if not os.path.exists(model_path):
            raise FileNotFoundError(
                f"No se encontró el modelo en {model_path}. "
                "Corre `python app/train.py` primero para entrenarlo."
            )
        self.pipeline = joblib.load(model_path)

    def predecir_prob_ocupado(self, zona: str, dia_semana: int, hora: int) -> float:
        X = pd.DataFrame([{"zona": zona, "dia_semana": dia_semana, "hora": hora}])
        pred = self.pipeline.predict(X)[0]
        return float(min(max(pred, 0.0), 1.0))

    def predecir_matriz(self, zona: str, dias: list[int], horas: list[int]):
        """
        Devuelve una matriz [dia][hora] con la probabilidad (0-100) de
        encontrar espacio LIBRE, calculada en batch para eficiencia.
        """
        filas = [
            {"zona": zona, "dia_semana": d, "hora": h}
            for d in dias
            for h in horas
        ]
        X = pd.DataFrame(filas)
        preds_ocupado = self.pipeline.predict(X)

        matriz = []
        idx = 0
        for _ in dias:
            fila = []
            for _ in horas:
                prob_libre = round((1 - preds_ocupado[idx]) * 100, 1)
                fila.append(max(0.0, min(100.0, prob_libre)))
                idx += 1
            matriz.append(fila)
        return matriz


def nivel_de(prob_libre_pct: float) -> str:
    if prob_libre_pct >= 60:
        return "alta"
    if prob_libre_pct >= 35:
        return "media"
    return "baja"


def generar_recomendacion(zona: str, dias: list[int], horas: list[int], matriz: list[list[float]]) -> str:
    """
    Genera una recomendación en lenguaje natural a partir de la matriz
    de predicciones del modelo: encuentra el mejor y el peor bloque
    horario entre semana (Lun-Vie) y arma un texto legible para el
    usuario. No es un texto fijo: cambia según lo que el modelo predijo.
    """
    mejor = {"valor": -1.0, "dia": None, "hora": None}
    peor = {"valor": 101.0, "dia": None, "hora": None}

    for i, d in enumerate(dias):
        if d == 5:  # excluimos sábado del análisis "entre semana"
            continue
        for j, h in enumerate(horas):
            v = matriz[i][j]
            if v > mejor["valor"]:
                mejor = {"valor": v, "dia": d, "hora": h}
            if v < peor["valor"]:
                peor = {"valor": v, "dia": d, "hora": h}

    if mejor["dia"] is None:
        return f"No hay suficientes datos entre semana para la Zona {zona}."

    def fmt_hora(h: int) -> str:
        suf = "AM" if h < 12 else "PM"
        h12 = h if h <= 12 else h - 12
        return f"{h12}:00 {suf}"

    return (
        f"Según el modelo, en la Zona {zona} la mejor probabilidad de espacio libre "
        f"es alrededor de {fmt_hora(mejor['hora'])} ({mejor['valor']:.0f}% libre). "
        f"Evita llegar cerca de {fmt_hora(peor['hora'])}, donde la probabilidad "
        f"baja a {peor['valor']:.0f}%."
    )
