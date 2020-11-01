import { Store } from 'express-session';

export default class PGStore extends Store {
  constructor(options = {}) {
    super(options);

    this.dbCruds = options.dbCruds;
    this.model = options.model;
  }

  /**
   * get
   * - Required
   * This required method is used to get a session from the store given
   * a session ID (sid).
   * The callback should be called as callback(error, session).
   * The session argument should be a session if found, otherwise null or
   * undefined if the session was not found (and there was no error).
   * A special case is made when error.code === 'ENOENT' to act like
   * callback(null, null).
   */
  get(uuid, callback) {
    this.dbCruds.read({ uuid }, (err, session) => {
      if (err) return callback(err);
      if (!session) return callback(null, null);
      callback(undefined, session.data);
    });
  }

  /**
   * set
   * - Required
   * This required method is used to upsert a session into the store given a
   * session ID (sid) and session (session) object. The callback should be
   * called as callback(error) once the session has been set in the store.
   */
  set(uuid, session, callback) {
    this.model.upsert({ uuid, data: session }, (err) => callback(err));
  }

  /**
   * destroy
   * - Required
   * This required method is used to destroy/delete a session from the store
   * given a session ID (sid). The callback should be called as callback(error)
   * once the session is destroyed.
   */
  destroy(uuid, callback) {
    this.dbCruds.del({ uuid }, (err) => callback(err));
  }

  /**
   * touch
   * - Recommended
   * This recommended method is used to "touch" a given session given
   * a session ID (sid) and session (session) object. The callback should be
   * called as callback(error) once the session has been touched.
   * This is primarily used when the store will automatically delete idle
   * sessions and this method is used to signal to the store the given session
   * is active, potentially resetting the idle timer.
   */
  touch(uuid, session, callback) {
    this.dbCruds.update({ uuid, data: session }, (err) => callback(err));
  }

  /**
   * all
   * - Optional
   * This optional method is used to get all sessions in the store as an array.
   * The callback should be called as callback(error, sessions).
   */
  all(callback) {
    this.dbCruds.select({}, (err, data) => {
      if (err) return callback(err);
      callback(
        undefined,
        data.session.map((row) => row.session)
      );
    });
  }

  /**
   * clear
   * - Optional
   * This optional method is used to delete all sessions from the store.
   * The callback should be called as callback(error) once the store is cleared.
   */
  clear(callback) {
    this.model.upsert({}, (err) => callback(err));
  }

  /**
   * length
   * - Optional
   * This optional method is used to get the count of all sessions in the store.
   * The callback should be called as callback(error, len).
   */
  length(callback) {
    this.model.upsert({}, callback);
  }
}
