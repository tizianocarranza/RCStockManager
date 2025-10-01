import mongoosePkg from 'mongoose';
import { ProductBaseSchema } from './ProductBase';

const { Schema, model, models } = mongoosePkg;

const OtroSchema = new Schema({
  ...ProductBaseSchema.obj,
  tipo: { type: String, enum: ['otro'], default: 'otro' }
});

export const Otro = models.Otro || model('Otro', OtroSchema); 