// Small type-level helpers shared across packages. Types only: nothing here exists at runtime.

/**
 * `Omit` applied to each member of a union separately. Plain `Omit<A | B, K>` first merges the union
 * into one object type and loses the fields that only some members have; this keeps every member.
 */
export type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
