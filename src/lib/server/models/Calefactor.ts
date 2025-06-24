import mongoosePkg from 'mongoose';
import { ProductBaseSchema } from './ProductBase';

const { Schema, model, models } = mongoosePkg;

const CalefactorSchema = new Schema({
  ...ProductBaseSchema.obj,
  tipo: { type: String, enum: ['calefactor'], default: 'calefactor' }
});

export const Calefactor = models.Calefactor || model('Calefactor', CalefactorSchema); 