from typing import List
from pydantic import BaseModel, Field


class PrediccionRequest(BaseModel):
    zona: str = Field(..., examples=["A"], description="Zona: A, B, C o D")
    dia_semana: int = Field(..., ge=0, le=5, description="0=Lunes ... 5=Sábado")
    hora: int = Field(..., ge=0, le=23, description="Hora del día en formato 24h")


class PrediccionResponse(BaseModel):
    zona: str
    dia_semana: int
    hora: int
    prob_ocupado: float
    prob_libre: float
    nivel: str  # "alta" | "media" | "baja" probabilidad de espacio libre


class HeatmapRequest(BaseModel):
    zona: str = Field(..., examples=["A"])
    dias: List[int] = Field(default=[0, 1, 2, 3, 4, 5])
    horas: List[int] = Field(default=[6, 8, 10, 12, 14, 16, 18])


class HeatmapResponse(BaseModel):
    zona: str
    dias: List[int]
    horas: List[int]
    matriz_prob_libre: List[List[float]]  # [dia][hora] -> 0-100
    recomendacion: str
    modelo_info: dict
