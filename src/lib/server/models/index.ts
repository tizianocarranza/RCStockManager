import type { Model } from 'mongoose';
import type { Tipo } from '$lib/logic/productTypes';
import { Radiador } from './Radiador';
import { Panel } from './Panel';
import { Electroventilador } from './Electroventilador';
import { Calefactor } from './Calefactor';
import { Evaporador } from './Evaporador';
import { Condensador } from './Condensador';
import { Intercooler } from './Intercooler';
import { Encauzador } from './Encauzador';
import { TanqueCombustible } from './TanqueCombustible';
import { KitDistribucion } from './KitDistribucion';
import { BombaAgua } from './BombaAgua';
import { Termostato } from './Termostato';
import { Compresor } from './Compresor';
import { VasoRecuperador } from './VasoRecuperador';
import { EnfriadorAceite } from './EnfriadorAceite';
import { Otro } from './Otro';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const modelBySlug: Record<Tipo, Model<any>> = {
	radiador: Radiador,
	panel: Panel,
	electroventilador: Electroventilador,
	calefactor: Calefactor,
	evaporador: Evaporador,
	condensador: Condensador,
	intercooler: Intercooler,
	encauzador: Encauzador,
	'tanque-combustible': TanqueCombustible,
	'kit-distribucion': KitDistribucion,
	'bomba-agua': BombaAgua,
	termostato: Termostato,
	compresor: Compresor,
	'vaso-recuperador': VasoRecuperador,
	'enfriador-aceite': EnfriadorAceite,
	otro: Otro
};
