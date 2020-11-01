import { waterfall } from 'async';

import { toSQL } from '../utils/types';

export default {
  drain: {
    description: 'Drain DB connection pool',
    action(_, { clients, callback }) {
      clients.pg.drain(callback);
    },
  },
  installExtension: {
    description: 'Install an extension',
    action({ extension }, { clients, callback }) {
      clients.pg.query(
        `CREATE EXTENSION IF NOT EXISTS "${extension}"`,
        callback
      );
    },
  },
  createSchema: {
    description: 'Create a schema',
    action({ name }, { clients, callback }) {
      clients.pg.query(`CREATE SCHEMA IF NOT EXISTS ${name}`, callback);
    },
  },
  createTable: {
    description: 'Create a table',
    action({ schema, name, columns }, { clients, callback }) {
      const fields = columns.map(
        (column) => `
        ${column.name} ${toSQL(column.type)}
        ${column.nullable ? '' : 'NOT'} NULL
        ${column.default !== undefined ? `DEFAULT ${column.default}` : ''}`
      );

      clients.pg.query(
        `CREATE TABLE IF NOT EXISTS ${schema}.${name} (${fields.join(',')})`,
        callback
      );
    },
  },
  constaintExists: {
    description: 'Check constraint existancy',
    action({ schema, table, name, type }, { clients, callback }) {
      clients.pg.query(
        `
        SELECT COUNT(1) AS test
        FROM information_schema.table_constraints
        WHERE constraint_type = '${type}'
        AND constraint_name = '${name.toLowerCase()}'
        AND table_name = '${table.toLowerCase()}'
        AND table_schema = '${schema.toLowerCase()}'
        `,
        (err, res) => {
          if (err) callback(err);
          else callback(null, res.rows[0].test);
        }
      );
    },
  },
  addPrimary: {
    description: 'Add primary',
    action({ schema, table, columns }, { clients, models, callback }) {
      const name = `${table}_primary`;
      waterfall(
        [
          (cb) =>
            models.db.constaintExists(
              { schema, table, name, type: 'PRIMARY KEY' },
              cb
            ),
          (exists, cb) =>
            exists
              ? cb()
              : clients.pg.query(
                  `
                  ALTER TABLE ${schema}.${table}
                  ADD CONSTRAINT ${name}
                  PRIMARY KEY (${columns.join(',')})
                  `,
                  cb
                ),
        ],
        callback
      );
    },
  },
  addUnique: {
    description: 'Add unique',
    action({ schema, name, table, columns }, { clients, models, callback }) {
      waterfall(
        [
          (cb) =>
            models.db.constaintExists(
              { schema, table, name, type: 'UNIQUE' },
              cb
            ),
          (exists, cb) =>
            exists
              ? cb()
              : clients.pg.query(
                  `
                  ALTER TABLE ${schema}.${table}
                  ADD CONSTRAINT ${name}
                  UNIQUE (${columns.join(',')})
                  `,
                  cb
                ),
        ],
        callback
      );
    },
  },
  addForeignKey: {
    description: 'Add foreign key',
    action({ schema, table, column, refers }, { clients, models, callback }) {
      const name = `fk_${table}_${column}`;
      waterfall(
        [
          (cb) =>
            models.db.constaintExists(
              { schema, table, name, type: 'FOREIGN KEY' },
              cb
            ),
          (exists, cb) =>
            exists
              ? cb()
              : clients.pg.query(
                  `
                  ALTER TABLE ${schema}.${table}
                  ADD CONSTRAINT ${name}
                  FOREIGN KEY (${column})
                  REFERENCES ${refers.schema || schema}.${refers.table}
                  (${refers.column})
                  `,
                  cb
                ),
        ],
        callback
      );
    },
  },
};
