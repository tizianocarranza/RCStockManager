import { connectToDB } from "./db/db";
import { toSerializableArray, toSerializableObject } from "$lib/logic/serialization";
import { Radiador as RadiadorModel } from "./models/Radiador";
import { Panel as PanelModel } from "./models/Panel";
import { Electroventilador as ElectroventiladorModel } from "./models/Electroventilador";

import type { Products, Radiador, Panel, Electroventilador } from "$lib/types/types";

export const getAllProducts = async (): Promise<Products> => {
    await connectToDB();

    try {
        const [radiadoresRaw, panelesRaw, electroventiladoresRaw] = await Promise.all([
            RadiadorModel.find().lean(),
            PanelModel.find().lean(),
            ElectroventiladorModel.find().lean()
        ]);

        return {
            radiadores: toSerializableArray<Radiador>(radiadoresRaw),
            paneles: toSerializableArray<Panel>(panelesRaw),
            electroventiladores: toSerializableArray<Electroventilador>(electroventiladoresRaw)
        };
    } catch (err) {
        throw new Error("Error fetching data");
    }
};

export const getProductById = async (
    id: string,
    tipo: string
): Promise<Radiador | Panel | Electroventilador | null> => {
    await connectToDB();

    try {
        let product = null;

        console.log("TIPO RECIBIDO:", JSON.stringify(tipo));

        switch (tipo) {
            case "Radiador":
                product = await RadiadorModel.findById(id).lean<Radiador>().exec();
                break;
            case "Panel":
                product = await PanelModel.findById(id).lean<Panel>().exec();
                break;
            case "Electroventilador":
                product = await ElectroventiladorModel.findById(id).lean<Electroventilador>().exec();
                break;
            default:
                throw new Error("Tipo de producto no reconocido");
        }

        if (!product || Array.isArray(product)) {
            throw new Error("Producto no encontrado o tipo de dato inválido");
        }

        return toSerializableObject<typeof product>(product);
    } catch (err) {
        console.error("Error fetching product by ID:", err);
        throw new Error("Error al obtener el producto");
    }
};

export const updateProduct = async (productData: any) => {
    await connectToDB();

    const { id, tipo, codigo, detalle, cantidad, notas, material, dimensiones, filas, electroventilador } =
        productData;

    let model;
    let updateFields = {};

    switch (tipo) {
        case "Radiador":
            model = RadiadorModel;
            updateFields = { codigo, detalle, cantidad, notas, material, dimensiones };
            break;
        case "Panel":
            model = PanelModel;
            updateFields = { codigo, detalle, cantidad, notas, material, dimensiones, filas };
            break;
        case "Electroventilador":
            model = ElectroventiladorModel;
            updateFields = {
                codigo,
                detalle,
                cantidad,
                notas,
                diametro: electroventilador.diametro,
                aspas: electroventilador.aspas
            };
            break;
        default:
            throw new Error("Tipo de producto no reconocido");
    }

    try {
        await model.findByIdAndUpdate(id, updateFields);
        const updated = await model.findById(id).lean();
        return toSerializableObject(updated);
    } catch (error) {
        console.error("Error al actualizar el producto:", error);
        throw new Error("No se pudo actualizar el producto");
    }
};

function getModelByTipo<T>(tipo: string): { model: import("mongoose").Model<T> } {
    switch (tipo) {
        case "Radiador":
            return { model: RadiadorModel as import("mongoose").Model<T> };
        case "Panel":
            return { model: PanelModel as import("mongoose").Model<T> };
        case "Electroventilador":
            return { model: ElectroventiladorModel as import("mongoose").Model<T> };
        default:
            throw new Error("Tipo de producto no reconocido");
    }
}


export async function increaseProductQuantity(id: string, tipo: string, amount: number = 1) {
    await connectToDB();

    try {
        const { model } = getModelByTipo<Radiador | Panel | Electroventilador>(tipo);
        const current = await model.findById(id).lean<Radiador | Panel | Electroventilador>();
        if (!current) throw new Error("Producto no encontrado");

        const nuevaCantidad = (current.cantidad || 0) + amount;

        const updated = await model.findByIdAndUpdate(
            id,
            { cantidad: nuevaCantidad },
            { new: true }
        ).lean<Radiador | Panel | Electroventilador>();

        return {
            success: true,
            message: `Cantidad aumentada a ${nuevaCantidad}`,
            producto: toSerializableObject(updated)
        };
    } catch (error) {
        console.error("Error al aumentar la cantidad:", error);
        throw new Error("No se pudo actualizar el producto");
    }
}


export async function decreaseProductQuantity(id: string, tipo: string, amount: number = 1) {
    await connectToDB();

    try {
        const { model } = getModelByTipo<Radiador | Panel | Electroventilador>(tipo);
        const current = await model.findById(id).lean<Radiador | Panel | Electroventilador>();
        if (!current) throw new Error("Producto no encontrado");

        const nuevaCantidad = (current.cantidad || 0) - amount;
        if (nuevaCantidad < 0) throw new Error("Cantidad no puede ser negativa");

        const updated = await model.findByIdAndUpdate(
            id,
            { cantidad: nuevaCantidad },
            { new: true }
        ).lean<Radiador | Panel | Electroventilador>();

        return {
            success: true,
            message: `Cantidad reducida a ${nuevaCantidad}`,
            producto: toSerializableObject(updated)
        };
    } catch (error) {
        console.error("Error al reducir la cantidad:", error);
        throw new Error("No se pudo actualizar el producto");
    }
}

export const deleteProduct = async (id: string, tipo: string) => {
    await connectToDB();

    try {
        const { model } = getModelByTipo<Radiador | Panel | Electroventilador>(tipo);
        const deleted = await model.findByIdAndDelete(id).lean<Radiador | Panel | Electroventilador>();

        if (!deleted) {
            throw new Error("Producto no encontrado");
        }

        return {
            success: true,
            message: `Producto eliminado correctamente`,
            producto: toSerializableObject(deleted)
        };
    } catch (error) {
        console.error("Error al eliminar el producto:", error);
        throw new Error("No se pudo eliminar el producto");
    }
};


