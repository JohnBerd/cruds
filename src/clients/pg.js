import moment from 'moment';
import { pick } from 'lodash';
import { Pool, types } from 'pg';

/**
 * All values returned are either NULL or a string:
 * Type 20: bigint/int8
 */
types.setTypeParser(20, (v) => (v === null ? null : parseInt(v, 10)));
/**
 * Type 1700: numeric
 */
types.setTypeParser(1700, (v) => (v === null ? null : parseFloat(v)));
/**
 * Type 1114: timestamp
 */
types.setTypeParser(1114, (v) => (v === null ? null : moment.utc(v).valueOf()));

export default ({ config, logger }) => {
  const pool = new Pool(config.postgres);
  logger.debug(
    '[INIT] created pool',
    pick(config.postgres, ['host', 'port', 'user', 'database'])
  );

  pool.on('error', (err) => {
    logger.error(`Idle PG client error: ${err.message} ${err.stack}`);
  });
  return {
    query: (...args) => pool.query(...args),
    drain: (callback) => pool.end(callback),
  };
};
