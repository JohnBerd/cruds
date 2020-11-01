import { profiles } from '../../utils/types';

export default {
  description: 'Set profile as Admin',
  cli: true,
  inputs: { uuid: 'uuid' },
  output: profiles.read,
  action({ uuid }, { models, callback }) {
    models.profiles.setAdmin({ uuid }, callback);
  },
};