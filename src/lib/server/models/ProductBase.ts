import mongoosePkg from 'mongoose';

const { Schema } = mongoosePkg;

export const ProductBaseSchema = new Schema({
  codigo: { type: String, required: true },
  detalle: { type: String, required: true },
  tipo: { type: String, required: true, enum: ['radiador', 'panel', 'electroventilador', 'otro'] },
  cantidad: { type: Number, required: true },
  dimensiones: {
    alto: Number,
    ancho: Number,
    espesor: Number,
  },
  marca: String,
  notas: String,
}, { _id: false });
