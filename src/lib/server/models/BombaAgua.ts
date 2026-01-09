import mongoosePkg from 'mongoose';
import { ProductBaseSchema } from './ProductBase';

const { Schema, model, models } = mongoosePkg;

const BombaAguaSchema = new Schema({
  ...ProductBaseSchema.obj,
  tipo: { type: String, enum: ['bomba-agua'], default: 'bomba-agua' }
});

export const BombaAgua = models.BombaAgua || model('BombaAgua', BombaAguaSchema);
