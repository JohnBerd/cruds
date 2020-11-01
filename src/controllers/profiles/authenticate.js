import { profiles } from '../../utils/types';

export default {
  description: 'Authenticate profile',
  cli: false,
  inputs: { email: 'email', password: 'string' },
  output: profiles.read,
  action({ email, password }, { models, callback }) {
    models.profiles.authenticate({ email, password }, callback);
  },
};
