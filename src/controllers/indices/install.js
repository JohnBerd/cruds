import fs from 'fs';
import { resolve } from 'path';

import { eachSeries, waterfall } from 'async';

import skills from '../../../assets/indices/schemas/skills.json';

const definitions = {
  skills,
};

export default {
  description: 'Install indices',
  cli: true,
  inputs: {
    indices: '?string[]',
  },
  action({ indices = ['skills'] }, { controllers, models, callback }) {
    eachSeries(indices, (indice, cb) =>
      models.indices.create(definitions[indice], cb)
    );
  },
};
