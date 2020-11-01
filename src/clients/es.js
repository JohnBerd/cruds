const { Client } = require('@elastic/elasticsearch');

export default ({ config, logger }) => {
  const client = new Client({
    node: `http://${config.elasticsearch.host}:${config.elasticsearch.port}`,
  });

  logger.debug('[INIT] created ES client', config.elasticsearch);
  return client;
};
