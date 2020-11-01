import { defaults } from 'lodash';
import { waterfall } from 'async';
import { hash, compare } from 'bcrypt';

export default {
  getByEmail: {
    description: 'Set profile password',
    action({ email }, { clients, callback }) {
      clients.pg.query(
        {
          text: `SELECT * FROM main.profiles WHERE email = $1`,
          values: [email],
        },
        (err, res) => {
          if (err) return callback(err);
          callback(undefined, res.rows[0]);
        }
      );
    },
  },
  setPassword: {
    description: 'Set profile password',
    action({ uuid, password }, { dbCruds, callback }) {
      waterfall(
        [
          (cb) => hash(password, 10, cb),
          (hash, cb) =>
            dbCruds.main.profiles.update({ uuid, password: hash }, cb),
        ],
        callback
      );
    },
  },
  setAdmin: {
    description: 'Set user as admin',
    action({ uuid }, { dbCruds, callback }) {
      waterfall(
        [(cb) => dbCruds.main.profiles.update({ uuid, role: 'admin' }, cb)],
        callback
      );
    },
  },
  authenticate: {
    description: 'Authenticate profile',
    action({ email, password }, { dbCruds, models, callback }) {
      waterfall(
        [
          (cb) => models.profiles.getByEmail({ email }, cb),
          (profile, cb) => {
            console.log(profile);
            if (!profile)
              return cb(new Error(`No profile found for email: ${email}`));
            return cb(undefined, profile);
          },
          (profile, cb) =>
            compare(password, profile.password, (err, result) =>
              cb(err, result ? profile : undefined)
            ),
        ],
        callback
      );
    },
  },
};
