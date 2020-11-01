import { dbCommons } from './utils';

import main from '../../../assets/db/schemas/main.json';

export const profileMissions = dbCommons(main, 'profileMissions');
