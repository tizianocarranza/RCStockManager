import mongoosePkg from 'mongoose';
import { ProductBaseSchema } from './ProductBase';

const { Schema, model, models } = mongoosePkg;

const IntercoolerSchema = new Schema({
  ...ProductBaseSchema.obj,
  tipo: { type: String, enum: ['intercooler'], default: 'intercooler' }
});

export const Intercooler = models.Intercooler || model('Intercooler', IntercoolerSchema); 