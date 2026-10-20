// FACTURAS ANTIGUAS (ejemplo 08): código escrito para money 1.x. También
// importa «money», pero está en la carpeta legacy/, y el «scope» del import
// map le da la versión 1. Nadie tuvo que reescribirlo para actualizar el resto.
import { format, VERSION } from 'money';

export const MONEY = { version: VERSION, url: import.meta.resolve('money') };

export function invoiceTotal(pesos) {
  return `Total: ${format(pesos)} M.N.`;
}
