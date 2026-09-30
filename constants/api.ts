// URL base del microservicio de IA (ai-service).
//
// - En desarrollo local con `expo start --web`, el valor por defecto
//   (localhost:8001) funciona directo.
// - En un dispositivo físico o emulador, cambia esto a la IP de tu
//   máquina en la red local (ej: http://192.168.1.20:8001) o define
//   la variable de entorno EXPO_PUBLIC_AI_API_URL antes de correr Expo.
// - Cuando se corre todo con `docker compose up`, el servicio se llama
//   `ai-service` dentro de la red de Docker (ver compose.yaml).
export const AI_API_URL =
  process.env.EXPO_PUBLIC_AI_API_URL ?? 'http://localhost:8001';
