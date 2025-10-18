import mongoosePkg from 'mongoose';

const { Schema } = mongoosePkg;

// Subdocumento para movimientos de stock
const StockEventSchema = new Schema({
  fecha: { type: Date, required: true },
  cantidad: { type: Number, required: true }
}, { _id: false });

// Schema base de producto
export const ProductBaseSchema = new Schema(
  {
    codigo: { type: String, required: true },
    detalle: { type: String, required: true },
    tipo: {
      type: String,
      required: true,
      enum: [
        'radiador',
        'panel',
        'electroventilador',
        'calefactor',
        'evaporador',
        'condensador',
        'intercooler',
        'encauzador',
        'tanque-combustible',
        'compresor',
        'vaso-recuperador',
        'enfriador-aceite',
        'otro',
      ],
    },
    cantidad: { type: Number, required: true, default: 0 },
    dimensiones: {
      alto: Number,
      ancho: Number,
      espesor: Number,
    },
    marca: String,
    notas: String,
    ultimoIngreso: { type: StockEventSchema, required: false, default: null },
    ultimoEgreso: { type: StockEventSchema, required: false, default: null }
  },
  { timestamps: true } // opcional, para createdAt/updatedAt
);
