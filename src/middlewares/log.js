export default ({ logger }) => {
  return (req, res, next) => {
    const { method, path } = req;
    logger.info(`[ROUTE] ${method}:${path} - Accepted`);

    req.on('end', () => {
      logger.verbose(`[ROUTE] ${method}:${path} - Served ${res.statusCode}`);
    });
    return next();
  };
};
