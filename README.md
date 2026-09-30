# Sistema Inteligente de Gestión de Estacionamiento y Seguridad en el Campus

Proyecto de la asignatura **Investigación Aplicada 1** — Escuela de Computación, Universidad Don Bosco (Campus Soyapango).

## Descripción

Aplicación web y móvil que combina sensores IoT (ultrasónicos o geomagnéticos) con un modelo de Inteligencia Artificial predictivo para reducir el tiempo de búsqueda de parqueo en horas pico dentro del campus de la UDB, mostrando a los usuarios un mapa en tiempo real de espacios libres/ocupados y una predicción de disponibilidad antes de llegar a la universidad.

## Integrantes del equipo

| Nombre completo | Carnet |
|---|---|
| [Valeria Liseth Paredes Lara] | [PL230400] |
| [Hector Vicenzo Rodriguez Vaquerano] | [RV230476] |
| [Fatima Beatriz Linares Magaña] | [LM230281] |
| [Leonel Oswaldo Rosales Franco] | [RF221733] |
| [Victor Manuel Tobar Casco] | [TC221525] |

## Repositorio

Enlace a este repositorio: `[pegar aquí el link de GitHub]`

## Tecnologías utilizadas

- **Frontend / App:** Next.js, React, TypeScript, React Native (Expo)
- **Sensores:** C/C++ sobre Arduino IDE (ESP32 / NodeMCU / Arduino Uno)
- **Comunicación IoT:** MQTT / HTTP REST
- **Base de datos en tiempo real:** Firebase Realtime Database / Firestore
- **Base de datos histórica:** PostgreSQL (Supabase) / MongoDB Atlas
- **Modelo de IA:** Python (scikit-learn / TensorFlow-Keras), servido con FastAPI o Flask
- **Hosting:** Vercel (frontend), Render / Railway (backend e IA)
- **Diseño UX/UI:** Figma
- **Modelo de negocio:** Canvanizer / Miro
- **Diagramas de arquitectura:** draw.io / Excalidraw
- **Gestión de proyecto:** Trello / Notion

## Organización de ramas

- `main`: rama principal y estable del proyecto.
- Cada integrante trabaja en su propia rama y fusiona sus cambios a `main` mediante Pull Request.

## Licencia

Este proyecto se distribuye bajo la [Licencia MIT](LICENSE).
