// LA COMPOSICIÓN DE LA APLICACIÓN (ejemplo 11): el único sitio que sabe qué
// fábrica hay detrás de cada clave. Las pruebas pasan overrides.
import { createContainer } from './container.js';
import { LOGGER, CLOCK, ORDERS, PAYMENTS } from './tokens.js';
import { createLogger } from './services/logger.js';
import { createClock } from './services/clock.js';
import { createPaymentGateway } from './services/payments.js';
import { createOrderService } from './services/orders.js';

export function createAppContainer(overrides = new Map()) {
  const container = createContainer()
    .register(LOGGER, createLogger)
    .register(CLOCK, createClock)
    .register(PAYMENTS, createPaymentGateway, { deps: [LOGGER] })
    .register(ORDERS, createOrderService, { deps: [LOGGER, CLOCK, PAYMENTS] });
  for (const [token, factory] of overrides) container.register(token, factory);
  return container;
}
