import mongoosePkg from 'mongoose';
import { ProductBaseSchema } from './ProductBase';

const { Schema, model, models } = mongoosePkg;

const EnfriadorAceiteSchema = new Schema({
  ...ProductBaseSchema.obj,
  tipo: { type: String, enum: ['enfriador-aceite'], default: 'enfriador-aceite' }
});

export const EnfriadorAceite = models.EnfriadorAceite || model('EnfriadorAceite', EnfriadorAceiteSchema); 