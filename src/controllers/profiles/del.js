import { profiles } from '../../utils/types';

export default {
  description: 'Delete profile',
  cli: true,
  inputs: profiles.selector,
  output: profiles.read,
  action(selector, { dbCruds, callback }) {
    dbCruds.main.profiles.del(selector, callback);
  },
};
