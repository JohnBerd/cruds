import { dbCommons } from './utils';

import main from '../../../assets/db/schemas/main.json';

export const notifications = dbCommons(main, 'notifications');