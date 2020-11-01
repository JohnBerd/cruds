import { isAbsolute, resolve } from 'path';
import { existsSync, readFileSync } from 'fs';

import { defaultsDeep } from 'lodash';
import types from 'typology';

const configType = {
  logger: {
    level: 'string',
    colorization: 'boolean',
    time: 'boolean',
  },
  server: {
    port: 'number',
  },
  postgres: {
    host: 'string',
    port: 'number',
    database: 'string',
    user: 'string',
    password: 'string',
    ssl: '?boolean',
    max: '?number',
    idleTimeoutMillis: '?number',
    connectionTimeoutMillis: '?number',
  },
  elasticsearch: {
    host: 'string',
    port: 'number',
  },
  aws: {
    key: 'string',
    secret: 'string',
  },
  app: {
    protocol: 'string',
    domain: 'string',
  },
};

export default (path, options) => {
  const configPath = isAbsolute(path) ? path : resolve(process.cwd(), path);

  if (!existsSync(configPath)) {
    throw new Error(`Unable to find configuration file: ${configPath}`);
  }

  const rawConfig = readFileSync(configPath, 'utf8');
  let configFile;

  try {
    configFile = JSON.parse(rawConfig);
  } catch (error) {
    throw new Error(`Unable to parse configuration file: ${error}`);
  }

  const config = defaultsDeep(options, configFile, {
    logger: {
      level: 'info',
      colorization: true,
      time: true,
    },
  });

  if (types.check(configType, config)) return config;

  const scan = types.scan(configType, config);
  throw new Error(
    `Invalid configuration file. Expected ${scan.expected} for ${(
      scan.path || []
    ).join('.')} but found ${JSON.stringify(scan.value)}`
  );
};
