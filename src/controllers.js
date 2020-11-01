import { omit } from 'lodash';

import {
  wrapNestedCollections,
  wrapTrack,
  wrapTrackDbCruds,
  loggerTrack,
} from './utils/wrappers';
import types from './utils/types';

import db from './controllers/db';
import server from './controllers/server';
import profiles from './controllers/profiles';

export const definitions = {
  db,
  server,
  profiles,
};

export default ({ config, logger, clients, dbCruds, models }) =>
  wrapNestedCollections(
    definitions,
    (
      { description, action, inputs, output },
      methodName,
      methods,
      controller,
      controllerName,
      controllers
    ) => {
      logger.debug(
        `[INIT] initialize controller method ${controllerName}.${methodName}`
      );

      const logHeader = `[CONTROLLER] ${controllerName}.${methodName}`;

      return (params = {}, callback = () => {}, track) => {
        logger.info(`[CONTROLLER] ${controllerName}.${methodName}`, {
          track,
        });
        logger.debug(`${logHeader} > ${description}`, { track, params });

        if (!types.check(inputs, params)) {
          const scan = types.scan(inputs, params);
          logger.error('[TYPES] type verification error', {
            track,
            types: omit(scan, ['value']),
          });
          return callback(
            new Error(
              `[CONTROLLER] Failed to call ${controllerName}.${methodName}`
            )
          );
        }

        return action(params, {
          config,
          logger: loggerTrack(logger, logHeader, track),
          clients,
          dbCruds: wrapTrackDbCruds(dbCruds, track),
          models: wrapTrack(models, track),
          controllers: wrapTrack(controllers, track),
          callback(err, res) {
            if (err) return callback(err);
            else callback(undefined, types.mask(output, res));
          },
          track,
        });
      };
    }
  );
