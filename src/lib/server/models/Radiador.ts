import mongoosePkg from 'mongoose';
import { ProductBaseSchema } from './ProductBase';

const { Schema, model, models } = mongoosePkg;

const RadiadorSchema = new Schema({
  ...ProductBaseSchema.obj,
  tipo: { type: String, enum: ['radiador'], default: 'radiador' },
  material: { type: String, enum: ['Aluminio y plastico', 'Cobre y bronce', 'Brazado'], required: true },
});

export const Radiador = models.Radiador || model('Radiador', RadiadorSchema);
