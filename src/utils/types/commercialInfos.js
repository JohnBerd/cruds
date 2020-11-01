import types from 'typology';

import { dbCommons } from './utils';

import main from '../../../assets/db/schemas/main.json';

export const commercialInfos = dbCommons(main, 'commercialInfos');