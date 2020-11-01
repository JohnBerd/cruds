import { waterfall } from 'async';

import { server } from '../../server';

export default {
  description: 'Stop server',
  cli: false,
  inputs: {},
  action({}, { logger, models, callback }) {
    waterfall(
      [
        (cb) => {
          logger.warn('Stop listenning');
          server.close(cb);
        },
        (cb) => {
          logger.warn('Drain database connection pool');
          models.db.drain(cb);
        },
      ],
      callback
    );
  },
};
