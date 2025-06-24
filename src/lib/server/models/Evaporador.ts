import mongoosePkg from 'mongoose';
import { ProductBaseSchema } from './ProductBase';

const { Schema, model, models } = mongoosePkg;

const EvaporadorSchema = new Schema({
  ...ProductBaseSchema.obj,
  tipo: { type: String, enum: ['evaporador'], default: 'evaporador' }
});

export const Evaporador = models.Evaporador || model('Evaporador', EvaporadorSchema); 