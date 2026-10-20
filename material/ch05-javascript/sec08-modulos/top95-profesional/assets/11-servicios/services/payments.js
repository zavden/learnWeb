// PASARELA DE PAGO (ejemplo 11), simulada.
export function createPaymentGateway(logger) {
  let next = 501;
  return {
    charge(customer, cents) {
      const id = `PAY-${next++}`;
      logger.info(`cobro ${id} a ${customer}: ${cents} centavos`);
      return id;
    },
  };
}
