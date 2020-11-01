import { dbCommons } from './utils';

import main from '../../../assets/db/schemas/main.json';

export const moods = dbCommons(main, 'moods');