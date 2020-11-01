import passport from 'passport';
import crypto from 'crypto';
import safeCompare from 'safe-compare';
import bodyParser from 'body-parser';
import  { exec } from 'child_process'

import { middlewares } from '../server';

export default () => ({
  prefix: '/app',
  middlewares: [],
  routes: [
    {
      name: 'Authenticate user',
      path: '/login',
      methods: ['POST'],
      inputs: {
        body: {
          email: 'email',
          password: 'string64',
        },
      },
      middlewares: [passport.authenticate('local')],
      action(req, res) {
        res.ok(req.user);
      },
    },
    {
      name: 'Logout user',
      path: '/logout',
      methods: ['POST'],
      inputs: {},
      action(req, res) {
        req.logout();
        req.session.destroy((err) => {
          res.ok();
        });
      },
    },
    {
      name: 'get current user',
      path: '/session',
      methods: ['GET'],
      inputs: {},
      middlewares: [middlewares.isAuthenticated()],
      action(req, res) {
        res.ok(req.user);
      },
    },
  ],
});
