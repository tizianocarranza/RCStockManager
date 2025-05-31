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

    const { id, tipo, codigo, detalle, cantidad, notas, material, dimensiones, filas, electroventilador } = productData;

    // First, find the current product to get its original type
    let originalProduct: any = null;
    try {
        // Try to find the product in each collection until we find it
        const models = [RadiadorModel, PanelModel, ElectroventiladorModel];
        for (const model of models) {
            const doc = await model.findById(id).lean();
            if (doc) {
                originalProduct = toSerializableObject(doc);
                break;
            }
        }

        if (!originalProduct) {
            throw new Error("Producto no encontrado");
        }
    } catch (error) {
        console.error("Error finding original product:", error);
        throw new Error("No se pudo encontrar el producto original");
    }

    // If the type has changed, we need to create a new document and delete the old one
    if (originalProduct.tipo.toLowerCase() !== tipo.toLowerCase()) {
        let newProduct;
        const baseFields = { codigo, detalle, cantidad, notas };

        try {
            // Create the new product with the correct type
            switch (tipo) {
                case "Radiador":
                    newProduct = await RadiadorModel.create({
                        ...baseFields,
                        tipo: "radiador",
                        material,
                        ...(dimensiones && { dimensiones })
                    });
                    break;
                case "Panel":
                    newProduct = await PanelModel.create({
                        ...baseFields,
                        tipo: "panel",
                        material,
                        ...(dimensiones && { dimensiones }),
                        ...(filas && { filas })
                    });
                    break;
                case "Electroventilador":
                    newProduct = await ElectroventiladorModel.create({
                        ...baseFields,
                        tipo: "electroventilador",
                        ...(dimensiones && { dimensiones }),
                        ...(electroventilador && {
                            diametro: electroventilador.diametro,
                            aspas: electroventilador.aspas
                        })
                    });
                    break;
                default:
                    throw new Error("Tipo de producto no reconocido");
            }

            // Delete the old product
            switch (originalProduct.tipo.toLowerCase()) {
                case "radiador":
                    await RadiadorModel.findByIdAndDelete(id);
                    break;
                case "panel":
                    await PanelModel.findByIdAndDelete(id);
                    break;
                case "electroventilador":
                    await ElectroventiladorModel.findByIdAndDelete(id);
                    break;
            }

            return toSerializableObject(newProduct);
        } catch (error) {
            console.error("Error during type change:", error);
            throw new Error("No se pudo cambiar el tipo del producto");
        }
    }

    // If the type hasn't changed, just update the existing document
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
                diametro: electroventilador?.diametro,
                aspas: electroventilador?.aspas,
                ...(dimensiones && { dimensiones })
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


