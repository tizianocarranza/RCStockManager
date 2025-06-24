import mongoosePkg from 'mongoose';
import { ProductBaseSchema } from './ProductBase';

const { Schema, model, models } = mongoosePkg;

const EncauzadorSchema = new Schema({
  ...ProductBaseSchema.obj,
  tipo: { type: String, enum: ['encauzador'], default: 'encauzador' }
});

export const Encauzador = models.Encauzador || model('Encauzador', EncauzadorSchema); 