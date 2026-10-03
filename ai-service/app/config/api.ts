import Constants from 'expo-constants';

// Extrae automáticamente la IP del host donde corre Metro Bundler
const debuggerHost = Constants.expoConfig?.hostUri;
const localhost = debuggerHost?.split(':')[0];

// Si estamos en desarrollo móvil usa la IP detectada; si es web usa localhost
export const AI_API_URL = localhost
    ? `http://${localhost}:8001`
    : 'http://localhost:8001';