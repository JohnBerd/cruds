import { eachSeries } from 'async';

import main from '../../../assets/db/schemas/main.json';

const definitions = {
  main,
};

export default {
  description: 'Install DB',
  cli: true,
  inputs: {
    schemas: '?string[]',
  },
  action({ schemas = ['main'] }, { controllers, callback }) {
    eachSeries(
      schemas,
      (schema, cb) =>
        controllers.db.createSchema(
          {
            name: schema,
            definition: definitions[schema],
          },
          cb
        ),
      callback
    );
  },
};
