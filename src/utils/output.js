import { toPairs, mapKeys } from 'lodash';
import tableFormat from 'as-table';

export default (data, json) => {
  if (json) return console.log(JSON.stringify(data, null, 2));

  if (Array.isArray(data))
    return console.log(tableFormat.configure({ delimiter: ' | ' })(data));

  return console.log(tableFormat(toPairs(mapKeys(data, (v, k) => `${k}:`))));
};
