import {
  wrapNestedCollections,
  wrapTrack,
  wrapTrackDbCruds,
  loggerTrack,
} from './utils/wrappers';

import db from './models/db';
import profiles from './models/profiles';
import sessions from './models/sessions';

export const definitions = {
  db,
  profiles,
  sessions,
};

export default ({ config, logger, clients, dbCruds }) =>
  wrapNestedCollections(
    definitions,
    (
      { description, action },
      methodName,
      methods,
      model,
      modelName,
      models
    ) => {
      logger.debug(`[INIT] initialize model method ${modelName}.${methodName}`);
      const logHeader = `[MODEL] ${modelName}.${methodName}`;
      return (params, callback, track) => {
        logger.verbose(`${logHeader}`, { track });
        logger.debug(`${logHeader} > ${description}`, { track, params });
        return action(params, {
          config,
          logger: loggerTrack(logger, logHeader, track),
          clients,
          dbCruds: wrapTrackDbCruds(dbCruds, track),
          models: wrapTrack(models, track),
          callback,
          track,
        });
      };
    }
  );
