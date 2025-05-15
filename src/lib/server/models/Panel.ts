import mongoosePkg from 'mongoose';
import { ProductBaseSchema } from './ProductBase';

const { Schema, model, models } = mongoosePkg;

const PanelSchema = new Schema({
  ...ProductBaseSchema.obj,
  tipo: { type: String, enum: ['panel'], default: 'panel' },
  material: { type: String, enum: ['Aluminio y plastico', 'Cobre y bronce', 'Brazado'], required: true },
  filas: {
    numero: { type: Number, required: true },
    tipo: { type: String, enum: ['Supertubular', 'Convencional'], required: true },
  }
});

export const Panel = models.Panel || model('Panel', PanelSchema);
