import { profiles } from '../../utils/types';

export default {
  description: 'Create profile',
  cli: true,
  inputs: profiles.create,
  output: profiles.read,
  action(data, { dbCruds, callback }) {
    dbCruds.main.profiles.create(data, callback);
  },
};
