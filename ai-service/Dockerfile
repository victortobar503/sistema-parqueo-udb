# syntax=docker/dockerfile:1
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

# Entrena el modelo durante el build para que la imagen ya salga lista
# con models/parking_model.pkl (no depende de un volumen externo).
# train.py genera los datos sintéticos automáticamente si no existen.
RUN cd app && python train.py

EXPOSE 8001

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
