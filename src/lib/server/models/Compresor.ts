import mongoosePkg from 'mongoose';
import { ProductBaseSchema } from './ProductBase';

const { Schema, model, models } = mongoosePkg;

const CompresorSchema = new Schema({
  ...ProductBaseSchema.obj,
  tipo: { type: String, enum: ['compresor'], default: 'compresor' }
});

export const Compresor = models.Compresor || model('Compresor', CompresorSchema); 