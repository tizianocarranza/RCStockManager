import mongoosePkg from 'mongoose';
import { ProductBaseSchema } from './ProductBase';

const { Schema, model, models } = mongoosePkg;

const TanqueCombustibleSchema = new Schema({
  ...ProductBaseSchema.obj,
  tipo: { type: String, enum: ['tanque-combustible'], default: 'tanque-combustible' }
});

export const TanqueCombustible = models.TanqueCombustible || model('TanqueCombustible', TanqueCombustibleSchema); 