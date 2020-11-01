import { waterfall, eachSeries } from 'async';
import { transform, each } from 'lodash';

export default {
  description: 'Create schema',
  cli: false,
  inputs: {
    name: 'string',
    definition: 'db.schema',
  },
  action({ name, definition }, { logger, models, callback }) {
    const { extensions, tables } = definition;

    const declarations = transform(
      tables,
      (collector, table, tableName) => {
        collector.tables.push({
          schema: name,
          name: tableName,
          columns: table.concat([
            { name: 'created', type: 'date', default: 'now()' },
            { name: 'updated', type: 'date', nullable: true },
          ]),
        });
        const primary = [];
        const uniques = {};
        table.forEach((column) => {
          if (column.primary) primary.push(column.name);
          if (column.unique) {
            uniques[column.unique] = uniques[column.unique] || [];
            uniques[column.unique].push(column.name);
          }
          if (column.refers)
            collector.foreigns.push({
              schema: name,
              table: tableName,
              column: column.name,
              refers: column.refers,
            });
        });

        if (primary.length > 0)
          collector.primaries.push({
            schema: name,
            table: tableName,
            columns: primary,
          });

        each(uniques, (columns, uniqueName) => {
          collector.uniques.push({
            schema: name,
            name: uniqueName,
            table: tableName,
            columns,
          });
        });
      },
      {
        tables: [],
        primaries: [],
        uniques: [],
        foreigns: [],
      }
    );

    waterfall(
      [
        // create schema
        (cb) => models.db.createSchema({ name }, (err) => cb(err)),
        // install extensions
        (cb) =>
          eachSeries(
            extensions,
            (extension, extCb) =>
              models.db.installExtension({ extension }, extCb),
            (err) => cb(err)
          ),
        // create each table
        (cb) =>
          eachSeries(declarations.tables, models.db.createTable, (err) =>
            cb(err)
          ),
        // create each primary
        (cb) =>
          eachSeries(declarations.primaries, models.db.addPrimary, (err) =>
            cb(err)
          ),
        // create each unique
        (cb) =>
          eachSeries(declarations.uniques, models.db.addUnique, (err) =>
            cb(err)
          ),
        // create each foreign key
        (cb) => eachSeries(declarations.foreigns, models.db.addForeignKey, cb),
      ],
      (err) => {
        if (err) return callback(err);

        logger.success(`Created schema ${name}`);
        return callback();
      }
    );
  },
};
