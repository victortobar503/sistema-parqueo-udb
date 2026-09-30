// puente-parqueo/estado.ts
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

const rutaKey = path.resolve(__dirname, 'firebase-credentials.json');
const key = JSON.parse(fs.readFileSync(rutaKey, 'utf8'));

if (!getApps().length) {
  initializeApp({ credential: cert(key) });
}

const db = getFirestore();

export async function actualizarEstadoEspacio(
  espacioId: string,
  areaId: string,
  nuevoEstado: 'libre' | 'ocupado'
) {
  await db.collection('espacios').doc(espacioId).set(
    {
      areaId,
      estado: nuevoEstado,
      ultimaActualizacion: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  const ahora = new Date();
  await db.collection('historial_ocupacion').add({
    espacioId,
    areaId,
    estado: nuevoEstado,
    timestamp: FieldValue.serverTimestamp(),
    diaSemana: ahora.getDay(),
    hora: ahora.getHours(),
  });
}