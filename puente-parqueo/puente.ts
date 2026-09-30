import dotenv from 'dotenv';
import path from 'path';
import { ReadlineParser, SerialPort } from 'serialport';
import { actualizarEstadoEspacio } from './estado';
dotenv.config({ path: path.resolve(__dirname, '.env') });

const ESPACIO_PILOTO = process.env.ESPACIO_PILOTO!;
const AREA_PILOTO = process.env.AREA_PILOTO!;

const port = new SerialPort({ path: process.env.PUERTO!, baudRate: 9600 });
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

port.on('open', () => console.log(`Conectado al Arduino en ${process.env.PUERTO}`));
port.on('error', (e) => console.error('Error serial:', e.message));

parser.on('data', async (line: string) => {
  const texto = line.trim();
  if (!texto.startsWith('{')) return; // ignora texto que no sea JSON

  try {
    const { espacio, ocupado } = JSON.parse(texto);
    if (espacio !== ESPACIO_PILOTO) return; // solo toca el espacio piloto

    await actualizarEstadoEspacio(espacio, AREA_PILOTO, ocupado ? 'ocupado' : 'libre');
    console.log(`Espacio ${espacio}: ${ocupado ? 'OCUPADO' : 'LIBRE'}`);
  } catch (err) {
    console.error('Error:', err);
  }
});