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

export type Products = {
  radiadores: Radiador[];
  paneles: Panel[];
  electroventiladores: Electroventilador[];
};
