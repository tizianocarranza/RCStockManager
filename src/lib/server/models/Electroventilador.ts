import mongoosePkg from 'mongoose';
import { ProductBaseSchema } from './ProductBase';

const { Schema, model, models } = mongoosePkg;

const ElectroventiladorSchema = new Schema({
  ...ProductBaseSchema.obj,
  tipo: { type: String, enum: ['electroventilador'], default: 'electroventilador' },
  aspas: { type: Number, required: false },
  diametro: { type: Number, required: false },
});

export const Electroventilador = models.Electroventilador || model('Electroventilador', ElectroventiladorSchema);
