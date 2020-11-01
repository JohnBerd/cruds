import passport from 'passport';
import LocalStrategy from 'passport-local';

export default ({ controllers }) => {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      controllers.profiles.authenticate({ email, password }, (err, user) => {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false);
        }
        return done(null, user);
      });
    })
  );

  passport.serializeUser(function (user, done) {
    done(null, user.uuid);
  });

  passport.deserializeUser(function (uuid, done) {
    controllers.profiles.read({ uuid }, done);
  });

  return {
    initialize: passport.initialize.bind(passport),
    session: passport.session.bind(passport),
  };
};
