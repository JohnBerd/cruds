import os from 'os';
import { createLogger, transports, format, addColors } from 'winston';
import uuid from 'uuid/v4';

const { combine, colorize, timestamp, printf } = format;

// availlable levels configuration
const levelConfiguration = [
  { name: 'error', color: 'red' },
  { name: 'warn', color: 'yellow' },
  { name: 'success', color: 'green' },
  { name: 'info', color: 'cyan' },
  { name: 'verbose', color: 'magenta' },
  { name: 'debug', color: 'grey' },
];

// extract levels priority and colors from levels configuration
const levels = {};
const colors = {};
levelConfiguration.forEach((level, index) => {
  levels[level.name] = index;
  colors[level.name] = level.color;
});

export default ({ level, colorization, time }) => {
  const formats = [
    time ? timestamp() : undefined,
    colorization ? colorize() : undefined,
    printf((data) => {
      const { level, message, timestamp } = data;

      const meta = JSON.stringify(
        Object.keys(data).reduce((collection, key) => {
          if (['level', 'message', 'timestamp'].indexOf(key) === -1) {
            collection[key] = data[key];
          }
          return collection;
        }, {})
      );

      return (
        (timestamp ? `${timestamp} ` : '') + `${level}: ${message} | ${meta}`
      );
    }),
  ].filter((f) => f);

  // create logger
  const logger = createLogger({
    level,
    levels,
    defaultMeta: {
      host: os.hostname(),
    },
    format: combine(...formats),
  });
  // Add levels colors
  addColors(colors);
  logger.add(new transports.Console());

  return levelConfiguration.reduce((collection, level) => {
    collection[level.name] = logger[level.name].bind(logger);
    return collection;
  }, {});
};
