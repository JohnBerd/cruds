import { defaults, omit } from 'lodash';

import { middlewares } from '../server';
import {
  profiles as profilesTypes,
  profileSkills as profileSkillsTypes,
} from '../utils/types';

export default ({ dbCruds, controllers }) => ({
  prefix: '/profile',
  middlewares: [middlewares.isAuthenticated(), middlewares.isCurrentProfile()],
  routes: [
    {
      name: 'Get a profile',
      path: '/:profile',
      methods: ['GET'],
      inputs: {
        params: {
          profile: 'uuid',
        },
      },
      action(req, res) {
        controllers.profiles.read(
          { uuid: req.params.profile },
          (err, profile) => {
            if (err) return res.error(err);
            res.ok(profile);
          }
        );
      },
    },
    {
      name: 'Update a profile',
      path: '/:profile',
      methods: ['POST'],
      inputs: {
        params: {
          profile: 'uuid',
        },
        body: profilesTypes.filter,
      },
      action(req, res) {
        controllers.profiles.update(
          defaults({ uuid: req.params.profile }, req.body),
          (err, profile) => {
            if (err) return res.error(err);
            res.ok(profile);
          }
        );
      },
    },
    {
      name: 'List profiles',
      path: '/:profile/list',
      methods: ['GET'],
      inputs: {
        params: {
          profile: 'uuid',
        },
      },
      action(req, res) {
        controllers.profiles.list(defaults({}, req.body), (err, profile) => {
          console.log(req.body);
          if (err) return res.error(err);
          res.ok(profile);
        });
      },
    },
    {
      name: 'Change password',
      path: '/:profile/password',
      methods: ['POST'],
      inputs: {
        params: {
          profile: 'uuid',
        },
      },
      action(req, res) {
        const { profile } = req.params;
        controllers.profiles.setPassword(
          { uuid: profile, ...req.body },
          (err, data) => {
            if (err) return res.error(err);
            res.ok(data);
          }
        );
      },
    },
  ],
});
