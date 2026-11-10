import type { ProductTypeDef } from '$lib/logic/productTypes';

export type Movimiento = {
  fecha: Date;
  cantidad: number;
};

export type BaseProduct = {
  _id?: string;
  codigo?: string;
  marca?: string;
  detalle?: string;
  cantidad: number;
  notas?: string;
  dimensiones?: {
    alto?: number;
    ancho?: number;
    espesor?: number;
  };
  ultimoIngreso?: Movimiento;
  ultimoEgreso?: Movimiento;
};

type Material = "Aluminio y plastico" | "Cobre y bronce" | "Brazado";
type TipoFilas = "Supertubular" | "Convencional";

export type Radiador = BaseProduct & {
  tipo: "radiador";
  material: Material;
};

export type Panel = BaseProduct & {
  tipo: "panel";
  material: Material;
  filas: {
    numero: number;
    tipo: TipoFilas;
  };
};

export type Electroventilador = BaseProduct & {
  tipo: "electroventilador";
  aspas?: number;
  diametro?: number;
};


export type Calefactor = BaseProduct & { tipo: "calefactor" };
export type Evaporador = BaseProduct & { tipo: "evaporador" };
export type Condensador = BaseProduct & { tipo: "condensador" };
export type Intercooler = BaseProduct & { tipo: "intercooler" };
export type Encauzador = BaseProduct & { tipo: "encauzador" };
export type TanqueCombustible = BaseProduct & { tipo: "tanque-combustible" };
export type Compresor = BaseProduct & { tipo: "compresor" };
export type VasoRecuperador = BaseProduct & { tipo: "vaso-recuperador" };
export type EnfriadorAceite = BaseProduct & { tipo: "enfriador-aceite" };
export type KitDistribucion = BaseProduct & { tipo: "kit-distribucion" };
export type BombaAgua = BaseProduct & { tipo: "bomba-agua" };
export type Termostato = BaseProduct & { tipo: "termostato" };
export type Otro = BaseProduct & { tipo: "otro" };


export type Product =
  | Radiador
  | Panel
  | Electroventilador
  | Calefactor
  | Evaporador
  | Condensador
  | Intercooler
  | Encauzador
  | TanqueCombustible
  | Compresor
  | VasoRecuperador
  | EnfriadorAceite
  | KitDistribucion
  | BombaAgua
  | Termostato
  | Otro;

/** Productos agrupados por etiqueta plural (ver `PRODUCT_TYPES`). */
export type Products = {
  [K in ProductTypeDef as K['plural']]: Extract<Product, { tipo: K['slug'] }>[];
};
