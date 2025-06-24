import mongoosePkg from 'mongoose';
import { ProductBaseSchema } from './ProductBase';

const { Schema, model, models } = mongoosePkg;

const VasoRecuperadorSchema = new Schema({
  ...ProductBaseSchema.obj,
  tipo: { type: String, enum: ['vaso-recuperador'], default: 'vaso-recuperador' }
});

export const VasoRecuperador = models.VasoRecuperador || model('VasoRecuperador', VasoRecuperadorSchema); 