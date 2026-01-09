import mongoosePkg from 'mongoose';
import { ProductBaseSchema } from './ProductBase';

const { Schema, model, models } = mongoosePkg;

const KitDistribucionSchema = new Schema({
  ...ProductBaseSchema.obj,
  tipo: { type: String, enum: ['kit-distribucion'], default: 'kit-distribucion' }
});

export const KitDistribucion = models.KitDistribucion || model('KitDistribucion', KitDistribucionSchema);
