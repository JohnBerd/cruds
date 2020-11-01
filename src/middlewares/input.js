import { defaults } from 'lodash';
import types from 'typology';

export default ({ params, query, body }) => {
  return (req, res, next) => {
    if (params && !types.check(params, req.params))
      return res.error(
        defaults({ part: 'params' }, types.scan(params, req.params)),
        400
      );

    if (query && !types.check(query, req.query))
      return res.error(
        defaults({ part: 'query' }, types.scan(query, req.query)),
        400
      );

    if (body && !types.check(body, req.body))
      return res.error(
        defaults({ part: 'body' }, types.scan(body, req.body)),
        400
      );

    return next();
  };
};
