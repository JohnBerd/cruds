import { profiles } from '../../utils/types';

export default {
  description: 'List profiles',
  cli: true,
  inputs: profiles.filter,
  output: [profiles.read],
  action(filters, { dbCruds, callback }) {
    dbCruds.main.profiles.select(filters, callback);
  },
};
