from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from schemas import (
    PrediccionRequest,
    PrediccionResponse,
    HeatmapRequest,
    HeatmapResponse,
)
from model import ModeloOcupacion, nivel_de, generar_recomendacion, cargar_info_modelo

app = FastAPI(
    title="Parqueo UDB - Servicio de IA",
    description=(
        "Microservicio de Inteligencia Artificial que predice la probabilidad "
        "de ocupación de las zonas de parqueo del campus, usando un modelo "
        "RandomForest entrenado con historial de ocupación (ver README)."
    ),
    version="1.0.0",
)

# Permitir que la app de Expo (web/móvil) consuma esta API sin problemas de CORS.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

modelo: ModeloOcupacion | None = None


@app.on_event("startup")
def cargar_modelo():
    global modelo
    modelo = ModeloOcupacion()


@app.get("/health")
def health():
    return {"status": "ok", "modelo_cargado": modelo is not None}


@app.post("/predict", response_model=PrediccionResponse)
def predict(req: PrediccionRequest):
    if modelo is None:
        raise HTTPException(status_code=503, detail="Modelo no disponible")

    if req.zona not in ["A", "B", "C", "D", "E"]:
        raise HTTPException(status_code=400, detail="Zona inválida (usa A, B, C o D)")

    prob_ocupado = modelo.predecir_prob_ocupado(req.zona, req.dia_semana, req.hora)
    prob_libre_pct = round((1 - prob_ocupado) * 100, 1)

    return PrediccionResponse(
        zona=req.zona,
        dia_semana=req.dia_semana,
        hora=req.hora,
        prob_ocupado=round(prob_ocupado * 100, 1),
        prob_libre=prob_libre_pct,
        nivel=nivel_de(prob_libre_pct),
    )


@app.post("/heatmap", response_model=HeatmapResponse)
def heatmap(req: HeatmapRequest):
    """
    Endpoint principal que consume la pantalla predicciones.tsx:
    devuelve la matriz completa día x hora (probabilidad de espacio
    libre) para una zona, más una recomendación generada a partir de
    esas predicciones.
    """
    if modelo is None:
        raise HTTPException(status_code=503, detail="Modelo no disponible")

    if req.zona not in ["A", "B", "C", "D", "E"]:
        raise HTTPException(status_code=400, detail="Zona inválida (usa A, B, C o D)")

    matriz = modelo.predecir_matriz(req.zona, req.dias, req.horas)
    recomendacion = generar_recomendacion(req.zona, req.dias, req.horas, matriz)

    return HeatmapResponse(
        zona=req.zona,
        dias=req.dias,
        horas=req.horas,
        matriz_prob_libre=matriz,
        recomendacion=recomendacion,
        modelo_info=cargar_info_modelo(),
    )


@app.get("/")
def root():
    return {
        "servicio": "Parqueo UDB - IA",
        "docs": "/docs",
        "endpoints": ["/health", "/predict", "/heatmap"],
    }
