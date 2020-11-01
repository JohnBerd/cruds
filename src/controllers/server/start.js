import { app, server } from '../../server';

export default {
  description: 'Start server',
  cli: true,
  inputs: {},
  action({}, { config, logger, controllers, callback }) {
    const sigterm = () => {
      logger.warn('Received sigterm.');
      controllers.server.stop({}, () => {
        process.exit();
      });
    };

    process.on('SIGTERM', sigterm);
    process.on('SIGINT', sigterm);

    server.listen(config.server.port, (err) => {
      if (!err) logger.success(`Listenning on ${config.server.port}`);
      callback(err);
    });
  },
};
