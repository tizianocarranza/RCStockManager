import { connectToDB } from "./db/db";
import { toSerializableArray, toSerializableObject } from "$lib/logic/serialization";
import { Radiador as RadiadorModel } from "./models/Radiador";
import { Panel as PanelModel } from "./models/Panel";
import { Electroventilador as ElectroventiladorModel } from "./models/Electroventilador";
import { Calefactor as CalefactorModel } from "./models/Calefactor";
import { Evaporador as EvaporadorModel } from "./models/Evaporador";
import { Condensador as CondensadorModel } from "./models/Condensador";
import { Intercooler as IntercoolerModel } from "./models/Intercooler";
import { Encauzador as EncauzadorModel } from "./models/Encauzador";
import { TanqueCombustible as TanqueCombustibleModel } from "./models/TanqueCombustible";
import { Compresor as CompresorModel } from "./models/Compresor";
import { VasoRecuperador as VasoRecuperadorModel } from "./models/VasoRecuperador";
import { EnfriadorAceite as EnfriadorAceiteModel } from "./models/EnfriadorAceite";
import { Otro as OtroModel } from "./models/Otro";
import type { Products, Radiador, Panel, Electroventilador, Calefactor, Evaporador, Condensador, Intercooler, Encauzador, TanqueCombustible, Compresor, VasoRecuperador, EnfriadorAceite, Otro } from "$lib/types/types";

export const getAllProducts = async (): Promise<Products> => {
    await connectToDB();

    try {
        const [radiadoresRaw, panelesRaw, electroventiladoresRaw, calefactoresRaw, evaporadoresRaw, condensadoresRaw, intercoolersRaw, encauzadoresRaw, tanquesCombustibleRaw, compresoresRaw, vasosRecuperadoresRaw, enfriadoresAceiteRaw, otrosRaw] = await Promise.all([
            RadiadorModel.find().lean(),
            PanelModel.find().lean(),
            ElectroventiladorModel.find().lean(),
            CalefactorModel.find().lean(),
            EvaporadorModel.find().lean(),
            CondensadorModel.find().lean(),
            IntercoolerModel.find().lean(),
            EncauzadorModel.find().lean(),
            TanqueCombustibleModel.find().lean(),
            CompresorModel.find().lean(),
            VasoRecuperadorModel.find().lean(),
            EnfriadorAceiteModel.find().lean(),
            OtroModel.find().lean()
        ]);

        return {
            radiadores: toSerializableArray<Radiador>(radiadoresRaw),
            paneles: toSerializableArray<Panel>(panelesRaw),
            electroventiladores: toSerializableArray<Electroventilador>(electroventiladoresRaw),
            calefactores: toSerializableArray<Calefactor>(calefactoresRaw),
            evaporadores: toSerializableArray<Evaporador>(evaporadoresRaw),
            condensadores: toSerializableArray<Condensador>(condensadoresRaw),
            intercoolers: toSerializableArray<Intercooler>(intercoolersRaw),
            encauzadores: toSerializableArray<Encauzador>(encauzadoresRaw),
            tanquesCombustible: toSerializableArray<TanqueCombustible>(tanquesCombustibleRaw),
            compresores: toSerializableArray<Compresor>(compresoresRaw),
            vasosRecuperadores: toSerializableArray<VasoRecuperador>(vasosRecuperadoresRaw),
            enfriadoresAceite: toSerializableArray<EnfriadorAceite>(enfriadoresAceiteRaw),
            otros: toSerializableArray<Otro>(otrosRaw)
        };
    } catch (err) {
        throw new Error("Error fetching data");
    }
};

export const getProductById = async (
    id: string,
    tipo: string
): Promise<any> => {
    await connectToDB();

    try {
        let product = null;
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
            case "Calefactor":
                product = await CalefactorModel.findById(id).lean<Calefactor>().exec();
                break;
            case "Evaporador":
                product = await EvaporadorModel.findById(id).lean<Evaporador>().exec();
                break;
            case "Condensador":
                product = await CondensadorModel.findById(id).lean<Condensador>().exec();
                break;
            case "Intercooler":
                product = await IntercoolerModel.findById(id).lean<Intercooler>().exec();
                break;
            case "Encauzador":
                product = await EncauzadorModel.findById(id).lean<Encauzador>().exec();
                break;
            case "TanqueCombustible":
                product = await TanqueCombustibleModel.findById(id).lean<TanqueCombustible>().exec();
                break;
            case "Compresor":
                product = await CompresorModel.findById(id).lean<Compresor>().exec();
                break;
            case "VasoRecuperador":
                product = await VasoRecuperadorModel.findById(id).lean<VasoRecuperador>().exec();
                break;
            case "EnfriadorAceite":
                product = await EnfriadorAceiteModel.findById(id).lean<EnfriadorAceite>().exec();
                break;
            case "Otro":
                product = await OtroModel.findById(id).lean<Otro>().exec();
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
        const models = [
            RadiadorModel, PanelModel, ElectroventiladorModel,
            CalefactorModel, EvaporadorModel, CondensadorModel, IntercoolerModel,
            EncauzadorModel, TanqueCombustibleModel, CompresorModel,
            VasoRecuperadorModel, EnfriadorAceiteModel, OtroModel
        ];
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

    console.log(tipo.toLowerCase());
    console.log(originalProduct.tipo.toLowerCase());

    // If the type has changed, we need to create a new document and delete the old one
    if (originalProduct.tipo.toLowerCase() !== tipo.toLowerCase()) {
        let newProduct;
        const baseFields = { codigo, detalle, cantidad, notas };

        try {
            // Create the new product with the correct type
            switch (tipo.toLowerCase()) {
                case "radiador":
                    newProduct = await RadiadorModel.create({ ...baseFields, tipo: "radiador", material, ...(dimensiones && { dimensiones }) });
                    break;
                case "panel":
                    newProduct = await PanelModel.create({ ...baseFields, tipo: "panel", material, ...(dimensiones && { dimensiones }), ...(filas && { filas }) });
                    break;
                case "electroventilador":
                    newProduct = await ElectroventiladorModel.create({ ...baseFields, tipo: "electroventilador", ...(dimensiones && { dimensiones }), ...(electroventilador && { diametro: electroventilador.diametro, aspas: electroventilador.aspas }) });
                    break;
                case "calefactor":
                    newProduct = await CalefactorModel.create({ ...baseFields, tipo: "calefactor", ...(dimensiones && { dimensiones }) });
                    break;
                case "evaporador":
                    newProduct = await EvaporadorModel.create({ ...baseFields, tipo: "evaporador", ...(dimensiones && { dimensiones }) });
                    break;
                case "condensador":
                    newProduct = await CondensadorModel.create({ ...baseFields, tipo: "condensador", ...(dimensiones && { dimensiones }) });
                    break;
                case "intercooler":
                    newProduct = await IntercoolerModel.create({ ...baseFields, tipo: "intercooler", ...(dimensiones && { dimensiones }) });
                    break;
                case "encauzador":
                    newProduct = await EncauzadorModel.create({ ...baseFields, tipo: "encauzador", ...(dimensiones && { dimensiones }) });
                    break;
                case "tanque-combustible":
                    newProduct = await TanqueCombustibleModel.create({ ...baseFields, tipo: "tanque-combustible", ...(dimensiones && { dimensiones }) });
                    break;
                case "compresor":
                    newProduct = await CompresorModel.create({ ...baseFields, tipo: "compresor", ...(dimensiones && { dimensiones }) });
                    break;
                case "vaso-recuperador":
                    newProduct = await VasoRecuperadorModel.create({ ...baseFields, tipo: "vaso-recuperador", ...(dimensiones && { dimensiones }) });
                    break;
                case "enfriador-aceite":
                    newProduct = await EnfriadorAceiteModel.create({ ...baseFields, tipo: "enfriador-aceite", ...(dimensiones && { dimensiones }) });
                    break;
                case "otro":
                    newProduct = await OtroModel.create({ ...baseFields, tipo: "otro", ...(dimensiones && { dimensiones }) });
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
                case "calefactor":
                    await CalefactorModel.findByIdAndDelete(id);
                    break;
                case "evaporador":
                    await EvaporadorModel.findByIdAndDelete(id);
                    break;
                case "condensador":
                    await CondensadorModel.findByIdAndDelete(id);
                    break;
                case "intercooler":
                    await IntercoolerModel.findByIdAndDelete(id);
                    break;
                case "encauzador":
                    await EncauzadorModel.findByIdAndDelete(id);
                    break;
                case "tanque-combustible":
                    await TanqueCombustibleModel.findByIdAndDelete(id);
                    break;
                case "compresor":
                    await CompresorModel.findByIdAndDelete(id);
                    break;
                case "vaso-recuperador":
                    await VasoRecuperadorModel.findByIdAndDelete(id);
                    break;
                case "enfriador-aceite":
                    await EnfriadorAceiteModel.findByIdAndDelete(id);
                    break;
                case "otro":
                    await OtroModel.findByIdAndDelete(id);
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
        case "radiador":
            model = RadiadorModel;
            updateFields = { codigo, detalle, cantidad, notas, material, dimensiones };
            break;
        case "Panel":
        case "panel":
            model = PanelModel;
            updateFields = { codigo, detalle, cantidad, notas, material, dimensiones, filas };
            break;
        case "Electroventilador":
        case "electroventilador":
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
        case "Calefactor":
        case "calefactor":
            model = CalefactorModel;
            updateFields = { codigo, detalle, cantidad, notas, ...(dimensiones && { dimensiones }) };
            break;
        case "Evaporador":
        case "evaporador":
            model = EvaporadorModel;
            updateFields = { codigo, detalle, cantidad, notas, ...(dimensiones && { dimensiones }) };
            break;
        case "Condensador":
        case "condensador":
            model = CondensadorModel;
            updateFields = { codigo, detalle, cantidad, notas, ...(dimensiones && { dimensiones }) };
            break;
        case "Intercooler":
        case "intercooler":
            model = IntercoolerModel;
            updateFields = { codigo, detalle, cantidad, notas, ...(dimensiones && { dimensiones }) };
            break;
        case "Encauzador":
        case "encauzador":
            model = EncauzadorModel;
            updateFields = { codigo, detalle, cantidad, notas, ...(dimensiones && { dimensiones }) };
            break;
        case "TanqueCombustible":
        case "Tanque-combustible":
        case "tanque-combustible":
            model = TanqueCombustibleModel;
            updateFields = { codigo, detalle, cantidad, notas, ...(dimensiones && { dimensiones }) };
            break;
        case "Compresor":
        case "compresor":
            model = CompresorModel;
            updateFields = { codigo, detalle, cantidad, notas, ...(dimensiones && { dimensiones }) };
            break;
        case "VasoRecuperador":
        case "Vaso-recuperador":
        case "vaso-recuperador":
            model = VasoRecuperadorModel;
            updateFields = { codigo, detalle, cantidad, notas, ...(dimensiones && { dimensiones }) };
            break;
        case "EnfriadorAceite":
        case "Enfriador-aceite":
        case "enfriador-aceite":
            model = EnfriadorAceiteModel;
            updateFields = { codigo, detalle, cantidad, notas, ...(dimensiones && { dimensiones }) };
            break;
        case "Otro":
        case "otro":
            model = OtroModel;
            updateFields = { codigo, detalle, cantidad, notas, ...(dimensiones && { dimensiones }) };
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
        case "radiador":
            return { model: RadiadorModel as import("mongoose").Model<T> };
        case "Panel":
        case "panel":
            return { model: PanelModel as import("mongoose").Model<T> };
        case "Electroventilador":
        case "electroventilador":
            return { model: ElectroventiladorModel as import("mongoose").Model<T> };
        case "Calefactor":
        case "calefactor":
            return { model: CalefactorModel as import("mongoose").Model<T> };
        case "Evaporador":
        case "evaporador":
            return { model: EvaporadorModel as import("mongoose").Model<T> };
        case "Condensador":
        case "condensador":
            return { model: CondensadorModel as import("mongoose").Model<T> };
        case "Intercooler":
        case "intercooler":
            return { model: IntercoolerModel as import("mongoose").Model<T> };
        case "Encauzador":
        case "encauzador":
            return { model: EncauzadorModel as import("mongoose").Model<T> };
        case "TanqueCombustible":
        case "Tanque-combustible":
        case "tanque-combustible":
            return { model: TanqueCombustibleModel as import("mongoose").Model<T> };
        case "Compresor":
        case "compresor":
            return { model: CompresorModel as import("mongoose").Model<T> };
        case "VasoRecuperador":
        case "Vaso-recuperador":
        case "vaso-recuperador":
            return { model: VasoRecuperadorModel as import("mongoose").Model<T> };
        case "EnfriadorAceite":
        case "Enfriador-aceite":
        case "enfriador-aceite":
            return { model: EnfriadorAceiteModel as import("mongoose").Model<T> };
        case "Otro":
        case "otro":
            return { model: OtroModel as import("mongoose").Model<T> };
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


