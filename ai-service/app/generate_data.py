"""
Generador de datos SINTÉTICOS de ocupación de parqueo.

Por qué sintéticos: el equipo aún no tiene un histórico real de sensores
IoT. Este script crea un dataset realista (con patrones de hora pico,
diferencias entre zonas y variación aleatoria) para poder entrenar un
modelo de verdad. Cuando el equipo tenga datos reales de los sensores,
basta con reemplazar este dataset por el histórico real y volver a
correr train.py: el resto del pipeline no cambia.
"""

import numpy as np
import pandas as pd

RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)

ZONAS = ["A", "B", "C", "D"]

# Capacidad total de espacios por zona (usada para pasar de % a conteo)
CAPACIDAD_ZONA = {"A": 6, "B": 4, "C": 6, "D": 4}

# Perfil base de ocupación por zona (0 = siempre libre, 1 = siempre lleno).
# Refleja que, por ejemplo, la Zona A (cafetín) se llena más rápido que
# la Zona D (biblioteca).
PERFIL_ZONA = {"A": 0.75, "B": 0.55, "C": 0.60, "D": 0.45}


def curva_hora_pico(hora: float) -> float:
    """
    Devuelve un factor de ocupación (0-1) según la hora del día.
    Dos picos: entrada de clases (~8am) y después de almuerzo (~1pm),
    con valles temprano en la mañana y al final de la tarde.
    """
    pico_manana = np.exp(-((hora - 8) ** 2) / (2 * 1.3 ** 2))
    pico_tarde = np.exp(-((hora - 13) ** 2) / (2 * 1.8 ** 2))
    base = 0.15
    factor = base + 0.55 * pico_manana + 0.45 * pico_tarde
    return float(np.clip(factor, 0, 1))


def factor_dia(dia_semana: int) -> float:
    """
    0=Lunes ... 5=Sábado. Entre semana hay más movimiento;
    sábado baja bastante (menos clases).
    """
    factores = {0: 1.00, 1: 1.05, 2: 1.00, 3: 1.02, 4: 0.85, 5: 0.35}
    return factores.get(dia_semana, 1.0)


def generar_dataset(n_semanas: int = 26) -> pd.DataFrame:
    """
    Genera n_semanas de historial simulado (por defecto ~6 meses),
    con una fila por combinación zona/día/hora, replicada semana a
    semana con ruido aleatorio para simular variabilidad real.
    """
    horas = np.arange(6, 19, 1)  # 6am a 6pm
    dias = np.arange(0, 6)       # Lunes(0) a Sábado(5)

    filas = []
    for semana in range(n_semanas):
        for dia in dias:
            for hora in horas:
                for zona in ZONAS:
                    prob_base = PERFIL_ZONA[zona] * curva_hora_pico(hora) * factor_dia(dia)
                    ruido = np.random.normal(0, 0.03)
                    prob_ocupado_real = float(np.clip(prob_base + ruido, 0.02, 0.98))

                    # Simulamos varias lecturas de sensores en la hora (cada ~15 min)
                    # y promediamos, tal como haría el backend con datos IoT reales.
                    # Esto reduce el ruido de una sola muestra binomial pequeña.
                    capacidad = CAPACIDAD_ZONA[zona]
                    lecturas = [
                        np.random.binomial(capacidad, prob_ocupado_real)
                        for _ in range(4)
                    ]
                    ocupados = int(round(np.mean(lecturas)))

                    filas.append({
                        "semana": semana,
                        "dia_semana": dia,
                        "hora": hora,
                        "zona": zona,
                        "capacidad": capacidad,
                        "ocupados": ocupados,
                        "prob_ocupado": round(ocupados / capacidad, 3),
                    })

    df = pd.DataFrame(filas)
    return df


if __name__ == "__main__":
    import os

    out_path = os.path.join(os.path.dirname(__file__), "..", "data", "historico_simulado.csv")
    os.makedirs(os.path.dirname(out_path), exist_ok=True)

    df = generar_dataset()
    df.to_csv(out_path, index=False)
    print(f"Dataset generado: {len(df)} filas -> {out_path}")
    print(df.head(10))
