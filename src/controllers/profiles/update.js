import { defaults } from 'lodash';

import { profiles } from '../../utils/types';

export default {
  description: 'Update profile',
  cli: true,
  inputs: defaults({}, profiles.filter, profiles.selector),
  output: profiles.read,
  action(data, { dbCruds, callback }) {
    dbCruds.main.profiles.update(data, callback);
  },
};