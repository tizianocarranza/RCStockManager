import mongoosePkg from 'mongoose';
import { TIPO_SLUGS } from '$lib/logic/productTypes';

const { Schema, model, models } = mongoosePkg;

/**
 * Registro de cada movimiento de stock.
 * - ingreso / egreso: `cantidad` positiva (unidades que entraron / salieron).
 * - ajuste: `cantidad` con signo (cambio hecho al crear o editar el producto);
 *   no cuenta como venta ni compra en las estadísticas.
 * codigo/detalle/marca son una copia al momento del movimiento, así el historial
 * sobrevive a borrados y renombres.
 */
const MovimientoSchema = new Schema(
	{
		productId: { type: Schema.Types.ObjectId, required: true },
		tipo: { type: String, enum: TIPO_SLUGS, required: true },
		codigo: String,
		detalle: String,
		marca: String,
		kind: { type: String, enum: ['ingreso', 'egreso', 'ajuste'], required: true },
		cantidad: { type: Number, required: true },
		stockResultante: Number,
		motivo: { type: String, enum: ['alta', 'edicion', 'seed'] },
		fecha: { type: Date, required: true, default: () => new Date() }
	},
	{ versionKey: false }
);

MovimientoSchema.index({ fecha: 1, kind: 1 });
MovimientoSchema.index({ productId: 1, fecha: -1 });

export const Movimiento = models.Movimiento || model('Movimiento', MovimientoSchema, 'movimientos');
