import { table, schema } from 'spacetimedb/server';
import { F64Builder, U64Builder, StringBuilder } from 'spacetimedb';

// Definición de la tabla con los dos argumentos separados
const operation_history = table(
  { public: true },
  {
    id:           new U64Builder().primaryKey().autoInc(),
    amount_given: new F64Builder(),
    price:        new F64Builder(),
    change:       new F64Builder(),
    timestamp:    new U64Builder(),
    user_id:      new StringBuilder(),
  }
);

const spacetimedb = schema({ operation_history });

export const add_operation = spacetimedb.reducer(
  {
    amount_given: new F64Builder(),
    price:        new F64Builder(),
    change:       new F64Builder(),
  },
  (ctx, { amount_given, price, change }) => {
    ctx.db.operation_history.insert({
      id:           0n,
      amount_given,
      price,
      change,
      timestamp:    BigInt(Date.now()),
      user_id:      ctx.sender?.toHexString() ?? 'anonymous',
    });
  }
);

export const clear_history = spacetimedb.reducer((ctx) => {
  for (const op of ctx.db.operation_history.iter()) {
    ctx.db.operation_history.id.delete(op.id);
  }
});

export default spacetimedb;
