import Polyglot from 'node-polyglot';

import fr from '../../assets/locales/fr.json';
import en from '../../assets/locales/en.json';

// Initialize locale:
const polyglot = new Polyglot();

polyglot.extend({ fr: fr });
polyglot.extend({ en: en });

export default (locale) => {
  return (path, ...args) => {
    return polyglot.t(
      [locale].concat(Array.isArray(path) ? path : path.split('.')).join('.'),
      ...args
    );
  };
};
