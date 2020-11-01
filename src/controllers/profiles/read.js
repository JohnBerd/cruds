import { profiles } from '../../utils/types';

export default {
  description: 'Read profile',
  cli: true,
  inputs: profiles.selector,
  output: profiles.read,
  action(selector, { dbCruds, callback }) {
    dbCruds.main.profiles.read(selector, callback);
  },
};