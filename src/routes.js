import { Router } from 'express';
import { v4 } from 'uuid';

import { app, middlewares } from './server';
import SessionStore from './utils/SessionStore';

import register from './routes/register';
import profiles from './routes/profiles';
import session from './routes/session';

export default ({ config, logger, dbCruds, models, controllers }) => {
  app.use(middlewares.json());
  app.use(middlewares.log({ logger }));
  app.use(middlewares.cookieParser());
  app.use(
    middlewares.session({
      cookie: {
        maxAge: 2147483647, // almost unlimited time
      },
      secret: 'secret',
      rolling: true,
      resave: true,
      saveUninitialized: false,
      genid() {
        return v4();
      },
      store: new SessionStore({
        dbCruds: dbCruds.main.sessions,
        model: models.sessions,
      }),
    })
  );

  const authentication = middlewares.authentication({ controllers });
  app.use(authentication.initialize());
  app.use(authentication.session());

  const routers = [].concat(
    register({ config, logger, dbCruds, controllers }),
    profiles({ config, logger, dbCruds, controllers }),
    session({ config, logger, dbCruds, controllers })
  );

  routers.forEach(({ prefix, middlewares: routerMiddlewares, routes }) => {
    logger.verbose(`[INIT] Initilize router ${prefix}`);
    const router = Router();

    routes.forEach(
      ({ path, methods, inputs, middlewares: routeMiddlewares, action }) => {
        methods.forEach((method) => {
          logger.debug(`[INIT] Initilize route ${method}:${prefix}${path}`);
          router[method.toLowerCase()](
            path,
            [middlewares.inputs(inputs)].concat(
              routerMiddlewares || [],
              routeMiddlewares || []
            ),
            action
          );
        });
      }
    );

    app.use(prefix, router);
  });
};
