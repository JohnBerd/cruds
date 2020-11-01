import { transform } from 'lodash';
import moment from 'moment';

import main from '../assets/db/schemas/main.json';

const cast = {
  timestamp(v) {
    return moment(v).toISOString();
  },
};

export const definitions = {
  main,
};

function createFactory({ pg }, logger, header, table, name, schemaName) {
  const mandatory = table
    .filter((column) => !column.default && !column.nullable)
    .map((column) => column.name);

  const nullables = table.filter((c) => c.nullable).map((c) => c.name);

  return (data = {}, callback, track) => {
    logger.verbose(`${header}.create`, { track });

    const missings = mandatory.filter((column) => data[column] === undefined);

    if (missings.length > 0)
      return callback(new Error(`Missing mandatory: ${missings.join(', ')}`));

    const columns = [];
    const indices = [];
    const values = [];
    table
      .filter(
        ({ name }) =>
          data[name] !== undefined &&
          (data[name] !== null || nullables.includes(name))
      )
      .forEach(({ name, type }) => {
        columns.push(name);
        indices.push(`$${indices.length + 1}`);
        values.push(cast[type] ? cast[type](data[name]) : data[name]);
      });

    const text = `
    INSERT INTO ${schemaName}.${name} (${columns.join(',')})
    VALUES (${indices.join(',')})
    RETURNING *`;
    console.log(text, values);
    return pg.query({ text, values }, (err, results) =>
      callback(err, ((results || {}).rows || [])[0])
    );
  };
}

function readFactory({ pg }, logger, header, table, name, schemaName) {
  const selectors = table
    .filter((column) => column.primary)
    .map((column) => column.name);

  return (data, callback, track) => {
    logger.verbose(`${header}.read`, { track });

    const missings = selectors.filter((column) => data[column] === undefined);

    if (missings.length > 0)
      return callback(new Error(`Missing selectors: ${missings.join(', ')}`));

    const values = selectors.map((column) => data[column]);
    const text = `SELECT * FROM ${schemaName}.${name} WHERE ${selectors
      .map((column, index) => `${column} = $${index + 1}`)
      .join(' AND ')}`;

    return pg.query({ text, values }, (err, results) =>
      callback(err, ((results || {}).rows || [])[0])
    );
  };
}

function updateFactory({ pg }, logger, header, table, name, schemaName) {
  const selectors = table
    .filter((column) => column.primary)
    .map((column) => column.name);

  const nullables = table.filter((c) => c.nullable).map((c) => c.name);

  return (data, callback, track) => {
    logger.verbose(`${header}.read`, { track });

    const missings = selectors.filter((column) => data[column] === undefined);

    if (missings.length > 0)
      return callback(new Error(`Missing selectors: ${missings.join(', ')}`));

    const values = selectors.map((name) => data[name]);
    const columns = table
      .filter(
        ({ name, primary }) =>
          data[name] !== undefined &&
          !primary &&
          (data[name] !== null || nullables.includes(name))
      )
      .map(({ name, type }) => {
        values.push(cast[type] ? cast[type](data[name]) : data[name]);
        return name;
      });

    if (values.length <= selectors.length)
      return callback(new Error(`Missing data: No data to update.`));

    columns.push('updated');
    values.push(moment.utc().toISOString());

    const text = `
    UPDATE ${schemaName}.${name}
    SET ${columns
      .map((column, index) => `${column} = $${index + 1 + selectors.length}`)
      .join(',')}
      WHERE ${selectors
        .map((column, index) => `${column} = $${index + 1}`)
        .join(' AND ')}
        RETURNING *`;
    console.log({ text, values });
    return pg.query({ text, values }, (err, results) =>
      callback(err, ((results || {}).rows || [])[0])
    );
  };
}

function delFactory({ pg }, logger, header, table, name, schemaName) {
  const selectors = table
    .filter((column) => column.primary)
    .map((column) => column.name);

  return (data, callback, track) => {
    logger.verbose(`${header}.read`, { track });

    const missings = selectors.filter((column) => data[column] === undefined);

    if (missings.length > 0)
      return callback(new Error(`Missing selectors: ${missings.join(', ')}`));

    const values = selectors.map((column) => data[column]);
    const text = `DELETE FROM ${schemaName}.${name} WHERE ${selectors
      .map((column, index) => `${column} = $${index + 1}`)
      .join(' AND ')}
      RETURNING *`;

    return pg.query({ text, values }, (err, results) =>
      callback(err, ((results || {}).rows || [])[0])
    );
  };
}

function selectFactory({ pg }, logger, header, table, name, schemaName) {
  const filters = table
    .filter((column) => !column.primary)
    .map((column) => column.name);

  return (data, callback, track) => {
    logger.verbose(`${header}.select`, { track });

    const columns = [];
    const values = [];
    filters
      .filter((column) => data[column] !== undefined)
      .forEach((column) => {
        columns.push(column);
        values.push(data[column]);
      });
    const text = `
      SELECT * FROM ${schemaName}.${name}
      ${columns.length > 0 ? 'WHERE' : ''}
      ${columns
        .map((column, index) => `${column} = $${index + 1}`)
        .join(' AND ')}`;

    return pg.query({ text, values }, (err, results) =>
      callback(err, (results || {}).rows || [])
    );
  };
}

export default ({ config, logger, clients }) => {
  return transform(definitions, (schemas, schema, schemaName) => {
    schemas[schemaName] = transform(
      schema.tables,
      (tables, table, tableName) => {
        const header = `[CRUDS] ${schemaName}.${tableName}`;
        tables[tableName] = {
          create: createFactory(
            clients,
            logger,
            header,
            table,
            tableName,
            schemaName
          ),
          read: readFactory(
            clients,
            logger,
            header,
            table,
            tableName,
            schemaName
          ),
          update: updateFactory(
            clients,
            logger,
            header,
            table,
            tableName,
            schemaName
          ),
          del: delFactory(
            clients,
            logger,
            header,
            table,
            tableName,
            schemaName
          ),
          select: selectFactory(
            clients,
            logger,
            header,
            table,
            tableName,
            schemaName
          ),
        };
        return tables;
      }
    );

    return schemas;
  });
};
