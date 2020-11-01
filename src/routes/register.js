import { defaults } from 'lodash';
import { waterfall } from 'async';

export default ({ controllers }) => ({
  prefix: '/register',
  middlewares: [],
  routes: [
    {
      name: 'Creates a profile and sets a password',
      path: '/',
      methods: ['POST'],
      inputs: {
        body: defaults({
          password: 'string',
          email: 'email',
        }),
      },
      action(req, res) {
        const { password, email } = req.body;
        waterfall(
          [
            (cb) => controllers.profiles.create({ email }, cb),
            (profile, cb) =>
              controllers.profiles.setPassword(
                { uuid: profile.uuid, password },
                cb
              ),
          ],
          (err, profile) => {
            if (err) return res.error(err);
            res.ok(profile);
          }
        );
      },
    },
  ],
});
