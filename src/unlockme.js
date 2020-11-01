#! /usr/bin/env node

import { resolve } from 'path';

import { Command } from 'commander';
import { each } from 'lodash';
import { v4 } from 'uuid';

import { version } from '../package.json';

import initConfig from './utils/config';
import initLogger from './utils/logger';
import output from './utils/output';

import initClients from './clients';
import initDbCruds from './dbCruds';
import initModels from './models';
import initControllers, { definitions } from './controllers';
import initRoutes from './routes';

// options are repeated over sub-commands to manage help display
function applyCommons(command) {
  command
    .option(
      '--config <path>',
      'Define config file to use',
      resolve(__dirname, '../config/sample.json')
    )
    .option('--json', 'Force json output', false)
    .option('--verbose', 'Enable verbose mode', false)
    .option('--debug', 'Enable debug mode, override --verbose', false)
    .option('--quiet', 'Mute logger, override --debug & --verbose', false);
}

function run(controller, method, data) {
  const { json, verbose, debug, quiet, config: path } = program.opts();
  const options = {};
  if (verbose) options.logger = { level: 'verbose' };
  if (debug) options.logger = { level: 'debug' };
  if (quiet) options.logger = { level: 'error' };

  const config = initConfig(path, options);
  const logger = initLogger(config.logger);
  const clients = initClients({ config, logger });
  const dbCruds = initDbCruds({ config, logger, clients });
  const models = initModels({ config, logger, clients, dbCruds });
  const controllers = initControllers({
    config,
    logger,
    clients,
    dbCruds,
    models,
  });

  if (controller === 'server')
    initRoutes({ config, logger, dbCruds, models, controllers });

  let params = {};
  if (data && !(data instanceof Command)) {
    try {
      params = JSON.parse(data);
    } catch (error) {
      logger.error('Unable to parse data', { data });
      process.exit(1);
    }
  }

  controllers[controller][method](
    params,
    (err, res) => {
      if (err) {
        logger.error(err);
        models.db.drain();
      } else if (res) {
        output(res, json);
        models.db.drain();
      }
    },
    { origin: 'cli', uuid: v4() }
  );
}

const program = new Command();
program
  .exitOverride()
  .name('unlockme')
  .version(version, '-v, --version', 'output the current version');
applyCommons(program);

each(definitions, (methods, controllerName) => {
  const controllerCommand = new Command(controllerName);
  controllerCommand.usage('<command> [options] [data]');
  applyCommons(controllerCommand);
  let methodCount = 0;

  each(methods, ({ description, inputs, cli }, methodName) => {
    if (cli) {
      methodCount++;

      const methodCommand = new Command(methodName);
      methodCommand.exitOverride();
      applyCommons(methodCommand);

      if (Object.keys(inputs).length > 0) {
        const optionnalData = Object.keys(inputs).reduce(
          (flag, input) => flag && inputs[input].startsWith('?'),
          true
        );

        methodCommand
          .arguments(optionnalData ? '[data]' : '<data>')
          .usage(`[options] '${JSON.stringify(inputs)}'`);
      }
      methodCommand.description(description);
      methodCommand.action((data) => run(controllerName, methodName, data));
      controllerCommand.addCommand(methodCommand);
    }
  });

  if (methodCount) program.addCommand(controllerCommand);
});

try {
  program.parse(process.argv);
} catch (error) {
  if (error.exitCode) {
    program.outputHelp();
  } else if (error.code !== 'commander.helpDisplayed') {
    console.error(error);
  }
}
