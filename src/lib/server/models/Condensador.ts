import mongoosePkg from 'mongoose';
import { ProductBaseSchema } from './ProductBase';

const { Schema, model, models } = mongoosePkg;

const CondensadorSchema = new Schema({
  ...ProductBaseSchema.obj,
  tipo: { type: String, enum: ['condensador'], default: 'condensador' }
});

export const Condensador = models.Condensador || model('Condensador', CondensadorSchema); 