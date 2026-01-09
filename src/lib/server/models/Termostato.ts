import mongoosePkg from 'mongoose';
import { ProductBaseSchema } from './ProductBase';

const { Schema, model, models } = mongoosePkg;

const TermostatoSchema = new Schema({
  ...ProductBaseSchema.obj,
  tipo: { type: String, enum: ['termostato'], default: 'termostato' }
});

export const Termostato = models.Termostato || model('Termostato', TermostatoSchema);
