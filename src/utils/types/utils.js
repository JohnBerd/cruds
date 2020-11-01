import types from 'typology';
import { defaults } from 'lodash';

import { isPlainObject } from '../helpers';

function applyMask(definition, data) {
  if (!definition) return data;

  if (Array.isArray(definition)) {
    if (!Array.isArray(data)) return [];

    return data.map((d) => applyMask(definition[0], d));
  }

  if (isPlainObject(definition)) {
    if (!isPlainObject(data)) return undefined;

    return Object.keys(definition).reduce((obj, key) => {
      obj[key] = applyMask(definition[key], data[key]);
      return obj;
    }, {});
  }

  if (types.check(definition, data)) return data;
  return undefined;
}

types.mask = applyMask;

export function dbCommons(schema, table) {
  const definitions = {};

  definitions.read = schema.tables[table]
    .filter((column) => !column.bcrypt)
    .reduce(
      (declaration, column) => {
        declaration[column.name] = column.type;
        return declaration;
      },
      {
        created: '?timestamp',
        updated: '?timestamp',
      }
    );
  types.add(`${table}.read`, definitions.read);

  definitions.create = schema.tables[table]
    .filter((column) => !column.bcrypt)
    .reduce((declaration, column) => {
      const mandatory = !column.default && !column.nullable;
      declaration[column.name] = `${mandatory ? '' : '?'}${column.type}`;
      return declaration;
    }, {});
  types.add(`${table}.create`, definitions.create);

  definitions.selector = schema.tables[table]
    .filter((column) => column.primary)
    .reduce((declaration, column) => {
      declaration[column.name] = `${column.type}`;
      return declaration;
    }, {});
  types.add(`${table}.selector`, definitions.selector);

  definitions.filter = schema.tables[table]
    .filter((column) => !column.primary && !column.bcrypt)
    .reduce((declaration, column) => {
      declaration[column.name] = `?${column.type}`;
      return declaration;
    }, {});
  types.add(`${table}.filter`, definitions.filter);

  return definitions;
}

const esType = {
  term: '?string',
  keyword: '?string|string[]',
  boolean: '?boolean',
  text: '?string',
};

export function esCommons({ name, mappings }) {
  const definitions = {};

  definitions.create = Object.keys(mappings.properties).reduce(
    (declaration, property) => {
      declaration[property] = esType[mappings.properties[property].type];
      return declaration;
    },
    {}
  );
  types.add(`${name}.create`, definitions.create);

  definitions.document = defaults({ id: 'uuid' }, definitions.create);
  types.add(`${name}.document`, definitions.document);

  return definitions;
}
