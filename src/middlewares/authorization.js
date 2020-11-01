import roles from '../utils/roles';

export function isCurrentProfile() {
  return (req, res, next) => {
    if (req.params.profile !== req.user.uuid)
      return res.error(new Error('Forbidden'), 403);

    next();
  };
}

export function isAdmin() {
  return (req, res, next) => {
    if (req.user.role !== 'admin')
      return res.error(new Error('Forbidden'), 403);
    next();
  };
}

export function isManager() {
  return (req, res, next) => {
    if (req.user.role === 'member')
      return res.error(new Error('Forbidden'), 403);
    next();
  };
}

export function isCurrentProfileAsset({
  dbCruds,
  schema = 'main',
  table,
  dataKey = 'uuid',
  itemKey = 'profile',
}) {
  return (req, res, next) => {
    dbCruds[schema][table].read({ uuid: req.params[dataKey] }, (err, data) => {
      if (err) return res.error(err);

      let ok;
      if (Array.isArray(data)) {
        ok = data.reduce(
          (flag, item) => flag && item[itemKey] === req.user.uuid,
          true
        );
      } else {
        ok = data[itemKey] === req.user.uuid;
      }

      if (!ok) return res.error(new Error('Forbidden'), 403);

      next();
    });
  };
}

export function isCurrentOrganizationRole({ role }) {
  return (req, res, next) => {
    if (req.params.organization !== req.user.organization)
      return res.error(new Error('Forbidden'), 403);

    if (roles[req.user.role] < roles[role])
      return res.error(new Error('Forbidden'), 403);

    next();
  };
}

export function isCurrentOrganizationAsset({
  dbCruds,
  schema = 'main',
  table,
  dataKey = 'uuid',
  itemKey = 'organization',
}) {
  return (req, res, next) => {
    dbCruds[schema][table].read({ uuid: req.params[dataKey] }, (err, data) => {
      if (err) return res.error(err);

      let ok;
      if (Array.isArray(data)) {
        ok = data.reduce(
          (flag, item) => flag && item[itemKey] === req.user.organization,
          true
        );
      } else {
        ok = data[itemKey] === req.user.organization;
      }

      if (!ok) return res.error(new Error('Forbidden'), 403);

      next();
    });
  };
}
