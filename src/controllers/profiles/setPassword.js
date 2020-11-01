import { profiles } from '../../utils/types';

export default {
  description: 'Set profile password',
  cli: true,
  inputs: { uuid: 'uuid', password: 'string' },
  output: profiles.read,
  action({ uuid, password }, { models, callback }) {
    models.profiles.setPassword({ uuid, password }, callback);
  },
};