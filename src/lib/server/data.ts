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
import type { Products, Radiador, Panel, Electroventilador, Calefactor, Evaporador, Condensador, Intercooler, Encauzador, TanqueCombustible, Compresor, VasoRecuperador, EnfriadorAceite, Otro, Movimiento } from "$lib/types/types";


export const typeMap: Record<string, string> = {
	// Singular
	'Radiador': 'radiador',
	'Panel': 'panel',
	'Electroventilador': 'electroventilador',
	'Calefactor': 'calefactor',
	'Evaporador': 'evaporador',
	'Condensador': 'condensador',
	'Intercooler': 'intercooler',
	'Encauzador': 'encauzador',
	'Tanque de combustible': 'tanque-combustible',
	'Compresor': 'compresor',
	'Vaso recuperador': 'vaso-recuperador',
	'Enfriador de aceite': 'enfriador-aceite',
	'Otro': 'otro',

	// Plural
	'Radiadores': 'radiador',
	'Paneles': 'panel',
	'Electroventiladores': 'electroventilador',
	'Calefactores': 'calefactor',
	'Evaporadores': 'evaporador',
	'Condensadores': 'condensador',
	'Intercoolers': 'intercooler',
	'Encauzadores': 'encauzador',
	'Tanques de combustible': 'tanque-combustible',
	'Compresores': 'compresor',
	'Vasos recuperadores': 'vaso-recuperador',
	'Enfriadores de aceite': 'enfriador-aceite',
	'Otros': 'otro',
};



export const modelMap: Record<string, any> = {
    // Singular keys (for create/update)
    'radiador': RadiadorModel,
    'panel': PanelModel,
    'electroventilador': ElectroventiladorModel,
    'calefactor': CalefactorModel,
    'evaporador': EvaporadorModel,
    'condensador': CondensadorModel,
    'intercooler': IntercoolerModel,
    'encauzador': EncauzadorModel,
    'tanque-combustible': TanqueCombustibleModel,
    'compresor': CompresorModel,
    'vaso-recuperador': VasoRecuperadorModel,
    'enfriador-aceite': EnfriadorAceiteModel,
    'otro': OtroModel,
};



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
            "Radiadores": toSerializableArray<Radiador>(radiadoresRaw),
            "Paneles": toSerializableArray<Panel>(panelesRaw),
            "Electroventiladores": toSerializableArray<Electroventilador>(electroventiladoresRaw),
            "Calefactores": toSerializableArray<Calefactor>(calefactoresRaw),
            "Evaporadores": toSerializableArray<Evaporador>(evaporadoresRaw),
            "Condensadores": toSerializableArray<Condensador>(condensadoresRaw),
            "Intercoolers": toSerializableArray<Intercooler>(intercoolersRaw),
            "Encauzadores": toSerializableArray<Encauzador>(encauzadoresRaw),
            "Tanques de combustible": toSerializableArray<TanqueCombustible>(tanquesCombustibleRaw),
            "Compresores": toSerializableArray<Compresor>(compresoresRaw),
            "Vasos recuperadores": toSerializableArray<VasoRecuperador>(vasosRecuperadoresRaw),
            "Enfriadores de aceite": toSerializableArray<EnfriadorAceite>(enfriadoresAceiteRaw),
            "Otros": toSerializableArray<Otro>(otrosRaw)
        };
        
    } catch (err) {
        throw new Error("Error fetching data");
    }
};

// New function for lazy loading products by type
export const getProductsByType = async (productType: string): Promise<any[]> => {
	await connectToDB();

	try {
		const key = typeMap[productType];
		const model = modelMap[key];

		if (!model) {
			throw new Error(`Tipo de producto no reconocido: ${productType}`);
		}

		const products = await model.find().lean();
		return toSerializableArray(products);
	} catch (err) {
		console.error(`Error fetching ${productType}:`, err);
		throw new Error(`Error fetching ${productType}`);
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

    const {
        id,
        tipo,
        codigo,
        detalle,
        cantidad,
        notas,
        material,
        dimensiones,
        filas,
        electroventilador,
    } = productData;

    const normalizedTipo = tipo.toLowerCase();
    const models = Object.values(modelMap);

    // Find the original product
    let originalProduct: any = null;
    let originalModelKey: string | null = null;

    for (const [key, model] of Object.entries(modelMap)) {
        const doc = await model.findById(id).lean();
        if (doc) {
            originalProduct = toSerializableObject(doc);
            originalModelKey = key;
            break;
        }
    }

    if (!originalProduct) throw new Error("Producto no encontrado");

    // --- Helper to build update fields ---
    const getUpdateFields = (type: string) => {
        const base = { codigo, detalle, cantidad, notas };
        switch (type) {
            case "radiador":
                return { ...base, material, dimensiones };
            case "panel":
                return { ...base, material, dimensiones, filas };
            case "electroventilador":
                return {
                    ...base,
                    diametro: electroventilador?.diametro,
                    aspas: electroventilador?.aspas,
                    ...(dimensiones && { dimensiones }),
                };
            default:
                return { ...base, ...(dimensiones && { dimensiones }) };
        }
    };

    // --- If type changed: create new and delete old ---
    if (originalProduct.tipo.toLowerCase() !== normalizedTipo) {
        const newModel = modelMap[normalizedTipo];
        const oldModel = modelMap[originalModelKey!];
        if (!newModel) {
            throw new Error("Tipo de producto no reconocido");
        }

        try {
            const newProduct = await newModel.create({
                ...getUpdateFields(normalizedTipo),
                tipo: normalizedTipo,
            });

            await oldModel.findByIdAndDelete(id);

            return toSerializableObject(newProduct);
        } catch (error) {
            console.error("Error durante el cambio de tipo:", error);
            throw new Error("No se pudo cambiar el tipo del producto");
        }
    }

    // --- If type didn't change: just update existing document ---
    const model = modelMap[normalizedTipo];
    if (!model) {
        throw new Error("Tipo de producto no reconocido");
    }

    try {
        await model.findByIdAndUpdate(id, getUpdateFields(normalizedTipo), { runValidators: true });
        const updated = await model.findById(id).lean();
        return toSerializableObject(updated);
    } catch (error) {
        console.error("Error al actualizar el producto:", error);
        throw new Error("No se pudo actualizar el producto");
    }
};

function getModelByTipo<T>(tipo: string): { model: import("mongoose").Model<T> } {
    switch (tipo.toLowerCase()) {
        case "radiador":
            return { model: RadiadorModel as import("mongoose").Model<T> };
        case "panel":
            return { model: PanelModel as import("mongoose").Model<T> };
        case "electroventilador":
            return { model: ElectroventiladorModel as import("mongoose").Model<T> };
        case "calefactor":
            return { model: CalefactorModel as import("mongoose").Model<T> };
        case "evaporador":
            return { model: EvaporadorModel as import("mongoose").Model<T> };
        case "condensador":
            return { model: CondensadorModel as import("mongoose").Model<T> };
        case "intercooler":
            return { model: IntercoolerModel as import("mongoose").Model<T> };
        case "encauzador":
            return { model: EncauzadorModel as import("mongoose").Model<T> };
        case "tanque-combustible":
            return { model: TanqueCombustibleModel as import("mongoose").Model<T> };
        case "compresor":
            return { model: CompresorModel as import("mongoose").Model<T> };
        case "vaso-recuperador":
            return { model: VasoRecuperadorModel as import("mongoose").Model<T> };
        case "enfriador-aceite":
            return { model: EnfriadorAceiteModel as import("mongoose").Model<T> };
        case "otro":
            return { model: OtroModel as import("mongoose").Model<T> };
        default:
            throw new Error("Tipo de producto no reconocido");
    }
}

export async function increaseProductQuantity(
    id: string,
    tipo: string,
    amount: number
) {

    const Model = modelMap[tipo.toLowerCase()];
    if (!Model) {
        console.error('Modelo no encontrado para tipo:', tipo);
        throw new Error('Tipo de producto no válido');
    }

    const product = await Model.findById(id);
    if (!product) {
        console.error('Producto no encontrado con id:', id);
        throw new Error('Producto no encontrado');
    }

    product.cantidad += amount;

    // Registrar último ingreso
    product.ultimoIngreso = {
        fecha: new Date(),
        cantidad: amount
    };

    if (!product.ultimoEgreso?.fecha || !product.ultimoEgreso?.cantidad) {
        product.ultimoEgreso = undefined;
    }

    try {
        await product.save();
    } catch (err) {
        console.error('Error guardando producto (increase):', err);
        throw err;
    }

    return { producto: product };
}

export async function decreaseProductQuantity(
    id: string,
    tipo: string,
    amount: number
) {
    const Model = modelMap[tipo.toLowerCase()];
    if (!Model) {
        console.error('Modelo no encontrado para tipo:', tipo);
        throw new Error('Tipo de producto no válido');
    }

    const product = await Model.findById(id);
    if (!product) {
        console.error('Producto no encontrado con id:', id);
        throw new Error('Producto no encontrado');
    }

    product.cantidad -= amount;
    if (product.cantidad < 0) product.cantidad = 0;

    // Registrar último egreso
    product.ultimoEgreso = {
        fecha: new Date(),
        cantidad: amount
    };

    if (!product.ultimoIngreso?.fecha || !product.ultimoIngreso?.cantidad) {
        product.ultimoIngreso = undefined;
    }

    try {
        await product.save();
    } catch (err) {
        console.error('Error guardando producto (decrease):', err);
        throw err;
    }

    return { producto: product };
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


