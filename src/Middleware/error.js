function error(err, req, res, next) {
  if (err.statusCode === 400) {
    return res.status(400).json({ message: "BAD_DATA", errors: err.error });
  } else {
    return res.status(err.statusCode).json(err.error);
  }
}

module.exports = error;
