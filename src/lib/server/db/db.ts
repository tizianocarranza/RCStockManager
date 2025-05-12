import mongoose from 'mongoose';
import { env } from '$env/dynamic/private';

const MONGODB_URI = env.MONGODB_URI;

if (!MONGODB_URI) {
	throw new Error('MONGODB_URI no está definida en las variables de entorno.');
}

let isConnected = false;

export async function connectToDB() {
	if (isConnected) return;

	try {
		await mongoose.connect(MONGODB_URI);
		isConnected = true;
		console.log('✅ Conectado a MongoDB con Mongoose');
	} catch (error) {
		console.error('❌ Error al conectar a MongoDB con Mongoose:', error);
		throw error;
	}
}
