import { dbCommons } from './utils';

import main from '../../../assets/db/schemas/main.json';

export const actions = dbCommons(main, 'actions');