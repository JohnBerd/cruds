import { transform } from 'lodash';

import pg from './clients/pg';
import es from './clients/es';
import mail from './clients/mail';

export default ({ config, logger }) =>
  transform(
    {
      pg,
      es,
      mail,
    },
    (clients, client, clientName) => {
      clients[clientName] = client({ config, logger });
      logger.verbose(`[INIT] initialized client ${clientName}`);
      return clients;
    },
    {}
  );
