export default {
  upsert: {
    description: 'Insert session if not exists, else update session data',
    action({ uuid, data = null }, { clients, callback }) {
      clients.pg.query(
        {
          text: `
          INSERT INTO main.sessions (uuid, data)
          VALUES ($1, $2)
          ON CONFLICT (uuid) DO UPDATE
          SET data = main.sessions.data
          RETURNING *`,
          values: [uuid, data],
        },
        (err, res) => {
          if (err) return callback(err);
          callback(undefined, res.rows[0]);
        }
      );
    },
  },
  clear: {
    description: 'Clear all sessions',
    action(_, { clients, callback }) {
      clients.pg.query('TRUNCATE TABLE main.sessions', (err) => callback(err));
    },
  },
  count: {
    description: 'Count all sessions',
    action(_, { clients, callback }) {
      clients.pg.query(
        'SELECT count(1) as length FROM main.sessions',
        (err, res) => {
          if (err) return callback(err);
          callback(undefined, res.rows[0].length);
        }
      );
    },
  },
};
