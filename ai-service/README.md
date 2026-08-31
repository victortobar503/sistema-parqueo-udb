# ai-service — Servicio de IA (Predicción de ocupación de parqueo)

Microservicio en **Python + FastAPI** que implementa el punto de
Inteligencia Artificial del prototipo: predice la probabilidad de que
una zona de parqueo esté **libre** en un día/hora determinado.

## ¿Qué tan "IA" es esto?

Es un modelo de **Machine Learning supervisado** real (no reglas fijas
ni datos quemados):

1. `generate_data.py` genera un histórico **sintético** (~26 semanas,
   ~8,100 registros) de ocupación por zona/día/hora, simulando el tipo
   de datos que llegarían de los sensores IoT del proyecto (picos de
   entrada ~8am, después de almuerzo ~1pm, menor actividad los
   sábados, etc.), más ruido aleatorio para que no sea una función
   perfecta.
2. `train.py` entrena un **`RandomForestRegressor`** (scikit-learn)
   que aprende a predecir `prob_ocupado` a partir de `zona`,
   `dia_semana` y `hora`, y guarda el modelo en
   `models/parking_model.pkl`.
3. `main.py` expone ese modelo mediante una **API REST (FastAPI)** que
   la app de React Native consume en tiempo real.

> Cuando el equipo tenga datos reales de los sensores, solo hay que
> reemplazar `data/historico_simulado.csv` (o la función
> `cargar_datos()` en `train.py`) por el histórico real y volver a
> correr `train.py`. El resto del pipeline (API, contrato con el
> frontend) no cambia.

## Estructura

```
ai-service/
├── app/
│   ├── generate_data.py   # Genera el dataset sintético
│   ├── train.py           # Entrena y guarda el modelo (.pkl)
│   ├── model.py           # Carga el modelo + genera predicciones y recomendaciones
│   ├── schemas.py         # Contratos de la API (Pydantic)
│   └── main.py            # API FastAPI (endpoints)
├── data/                  # CSV generado (se crea al correr generate_data.py)
├── models/                # Modelo entrenado (.pkl) (se crea al correr train.py)
├── requirements.txt
└── Dockerfile
```

## Cómo correrlo localmente (sin Docker)

```bash
cd ai-service
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cd app
python train.py                 # genera datos + entrena el modelo (~10s)
uvicorn main:app --reload --port 8001
```

La API queda disponible en `http://localhost:8001` y la documentación
interactiva (Swagger) en `http://localhost:8001/docs`.

## Cómo correrlo con Docker

Desde la raíz del repo:

```bash
docker compose up --build
```

Esto levanta **dos servicios**:
- `server` → la app de Expo (puerto 8081)
- `ai-service` → este microservicio (puerto 8001), con el modelo ya
  entrenado durante el build de la imagen.

## Endpoints

### `GET /health`
Chequeo de salud, confirma que el modelo está cargado.

### `POST /predict`
Predicción puntual.

```json
// Request
{ "zona": "A", "dia_semana": 1, "hora": 8 }

// Response
{
  "zona": "A", "dia_semana": 1, "hora": 8,
  "prob_ocupado": 55.5, "prob_libre": 44.5, "nivel": "media"
}
```

### `POST /heatmap`
Matriz completa día×hora para una zona (lo que consume la pantalla
"Predicciones IA" de la app) + una recomendación en texto generada a
partir de las predicciones del modelo.

```json
// Request
{ "zona": "A", "dias": [0,1,2,3,4,5], "horas": [6,8,10,12,14,16,18] }
```

## Métricas del modelo actual

Entrenado con 80/20 train-test split sobre el dataset sintético:
- **MAE** (error absoluto promedio): ~0.09 (9 puntos porcentuales)
- **R²** (varianza explicada): ~0.52

Estas métricas se imprimen en consola cada vez que se corre
`train.py`, y son las que se deberían reportar en el documento de
avance técnico y mencionar en el video demostrativo.
