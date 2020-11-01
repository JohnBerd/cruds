import types from 'typology';

const sql = {
  integer: 'integer',
  decimal: 'decimal',
  timestamp: 'timestamp',
  date: 'timestamp without time zone',
  json: 'jsonb',
  string16: 'character varying(16)',
  string32: 'character varying(32)',
  string64: 'character varying(64)',
  string128: 'character varying(128)',
  string256: 'character varying(256)',
  string512: 'character varying(512)',
  uuid: 'uuid',
  email: 'character varying(256)',
  phone: 'character varying(16)',
  role: 'character varying(32)',
};

export function toSQL(type) {
  return sql[type] || type;
}

types.add('db.column.foreignKey', {
  table: 'string128',
  column: 'string128',
});
types.add('db.column', {
  name: 'string128',
  type: 'string128',
  default: '?string',
  nullable: '?boolean',
  bcrypt: '?boolean',
  primary: '?boolean',
  unique: '?string128',
  refers: '?db.column.foreignKey',
});

types.add('db.table', ['db.column']);
types.add(
  'db.tableIndex',
  (v) =>
    typeof v === 'object' &&
    Object.keys(v).reduce((flag, table) => {
      return flag && types.check('db.table', v[table]);
    }, true)
);

types.add('db.schema', {
  extensions: '?string[]',
  tables: 'db.tableIndex',
});
