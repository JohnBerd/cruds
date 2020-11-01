import types from 'typology';

import roles from '../roles';

types.add('integer', (v) => v === parseInt(v, 10));
types.add('decimal', 'number');
types.add('timestamp', (v) => v === parseInt(v, 10));
types.add('json', 'object');

types.add('string[]', ['string']);

// 16, ..., 512
for (let len = 16; len < 1024; len *= 2) {
  types.add(`string${len}`, (v) => typeof v === 'string' && v.length <= len);
  types.add(`string${len}[]`, [`string${len}`]);
}

const regex = {
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
  email: /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  phone: /^[0-9().\- +]*$/,
};
Object.keys(regex).forEach((type) =>
  types.add(type, (v) => regex[type].test(v))
);

types.add('role', (v) => v in roles);
