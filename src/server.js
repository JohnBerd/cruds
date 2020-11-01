import { createServer } from 'http';
import express, { json } from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';

import inputs from './middlewares/input';
import log from './middlewares/log';
import authentication from './middlewares/authentication';
import {
  isCurrentProfile,
  isCurrentProfileAsset,
  isCurrentOrganizationRole,
  isCurrentOrganizationAsset,
  isAdmin,
  isManager,
} from './middlewares/authorization';

export const app = express();
export const server = createServer(app);

export const middlewares = {
  json,
  inputs,
  log,
  session,
  cookieParser,
  authentication,
  isAuthenticated() {
    return (req, res, next) => {
      if (req.isAuthenticated()) return next();
      return res.error(new Error('Unauthorized'), 401);
    };
  },
  isCurrentProfile,
  isCurrentProfileAsset,
  isCurrentOrganizationRole,
  isCurrentOrganizationAsset,
  isAdmin,
  isManager,
};

const response = app.response;

response.ok = function ok(data, status = 200) {
  this.status(status).json(data);
};

response.error = function error(err, status = 500) {
  const data =
    err instanceof Error ? { code: status, message: err.toString() } : err;
  this.status(status).json(data);
};
