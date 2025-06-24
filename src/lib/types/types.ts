export type BaseProduct = {
  _id: string;
  codigo: string;
  detalle: string;
  tipo: "radiador" | "panel" | "electroventilador" | "otro";
  cantidad: number;
  dimensiones?: {
    alto?: number;
    ancho?: number;
    espesor?: number;
  };
  marca?: string;
  notas?: string;
};

export type Radiador = BaseProduct & {
  tipo: "radiador";
  material: "Aluminio y plastico" | "Cobre y bronce";
};

export type Panel = BaseProduct & {
  tipo: "panel";
  material: "Aluminio y plastico" | "Cobre y bronce";
  filas: {
    numero: number;
    tipo: "Supertubular" | "Convencional";
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

export type Products = {
  radiadores: Radiador[];
  paneles: Panel[];
  electroventiladores: Electroventilador[];
  calefactores: Calefactor[];
  evaporadores: Evaporador[];
  condensadores: Condensador[];
  intercoolers: Intercooler[];
  encauzadores: Encauzador[];
  tanquesCombustible: TanqueCombustible[];
  compresores: Compresor[];
  vasosRecuperadores: VasoRecuperador[];
  enfriadoresAceite: EnfriadorAceite[];
};
