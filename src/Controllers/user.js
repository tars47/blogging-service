const Password = require("../Util/password");
const HttpError = require("../Util/httpError");
const db = require("../Util/database");
const INVALID = "INVALID_USERNAME_OR_PASSWORD";

/**
 *  @description -> This controller class implements all the handlers for /user subroutes
 */
class UserController {
  /**
   *  @description -> registers the user
   */
  async register(req, res, next) {
    try {
      let { username, email, password } = req.body;
      password = await Password.hash(password);
      const [{ insertId: user_id }] = await db.query(
        `
                                       
                INSERT INTO users (username, email, password)
                           VALUES (?, ?, ?)`,

        [username, email, password]
      );

      const token = this.signJwt({ user_id, username, email });

      return res.status(201).json({ message: "CREATED", user_id, username, email, token });
    } catch (err) {
      next(new HttpError(err));
    }
  }

  /**
   *  @description -> to login the user
   */
  async login(req, res, next) {
    try {
      console.log(req.body);
      let { username, password } = req.body;

      const [user] = await db.query(
        `
                                       
                SELECT user_id, username, email, password 
                       FROM users 
                       WHERE username=?`,

        [username]
      );

      if (user.length === 0) {
        return next(new HttpError({ message: INVALID }, 404));
      }
      const { user_id, username: uname, email, password: upass } = user[0];

      const isValidPassword = await Password.compare(password, upass);

      if (!isValidPassword) {
        return next(new HttpError({ message: INVALID }, 401));
      }

      const token = this.signJwt({ user_id, username: uname, email });

      return res.status(201).json({ user_id, email, username: uname, token });
    } catch (err) {
      console.log(err);
      next(new HttpError(err));
    }
  }
}

module.exports = UserController;
