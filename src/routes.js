const IsValid = require("./Middleware/validation");
const jwt = require("jsonwebtoken");
const { Router } = require("express");
const UserController = require("./Controllers/user");
const PostController = require("./Controllers/post");
const CommentController = require("./Controllers/comment");
const HttpError = require("./Util/httpError");

/**
 *  @description ->  This class implements all the sub routes of /user base route
 */
class Routes {
  /**
   * @description -> Creates an instance of Routes.
   */
  constructor() {
    this.user = new UserController();
    this.user.post = new PostController();
    this.user.post.comment = new CommentController();
    this.path = "/user";
    this.router = Router();
    this.mountRoutes();
  }

  /**
   * @description ->  this method registers all the sub routes of /user base route
   */
  mountRoutes() {
    // user related
    this.router.post(`/register`, this.validate, this.user.register.bind(this));
    this.router.post(`/login`, this.validate, this.user.login.bind(this));

    // post related
    this.router.post(
      `/:user_id/post`,
      this.validate,
      this.authenticate,
      this.user.post.create.bind(this)
    );
    this.router.get(`/:user_id/post/all`, this.authenticate, this.user.post.list.bind(this));
    this.router.get(`/:user_id/post/:post_id`, this.authenticate, this.user.post.view.bind(this));

    // comment related
    this.router.post(
      `/:user_id/post/:post_id/comment`,
      this.validate,
      this.validateComment,
      this.authenticate,
      this.user.post.comment.create.bind(this)
    );
  }

  /**
   * @description ->   middleware to validate req body/query
   */
  validate(req, res, next) {
    return IsValid(req, res, next);
  }

  /**
   * @description ->   middleware to validate comment pattern. comment shound not
   *                   contain url
   */
  validateComment(req, res, next) {
    const pattern =
      /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
    const regex = new RegExp(pattern);
    if (req.body.content.match(regex)) {
      return next(
        new HttpError(
          { message: "INVALID_COMMENT", detail: "Comment should not contain URLs" },
          400
        )
      );
    }
    next();
  }

  /**
   * @description ->   middleware to authenticate
   *                   this is not required as part of the assignment
   *                   but I included it it make the service more secure
   */
  authenticate(req, res, next) {
    if (!req.headers.jwt_token) {
      return next(new HttpError({ message: "JWT_TOKEN_REQUIRED" }, 401));
    }
    try {
      const decoded = jwt.verify(req.headers.jwt_token, process.env.JWT_SECRET);
      req.user = decoded.data;
      console.log(decoded);
      if (req.params?.user_id && req.params.user_id != req.user.user_id) {
        return next(
          new HttpError(
            {
              message: "JWT_TOKEN_MISMATCH",
              detail: "Jwt token doesnot belong to the user id present in the url params",
            },
            401
          )
        );
      }
      next();
    } catch (err) {
      switch (err.name) {
        case "TokenExpiredError": {
          return next(new HttpError({ message: "JWT_TOKEN_EXPIRED" }, 401));
        }
        case "JsonWebTokenError": {
          return next(new HttpError({ message: "JWT_TOKEN_ERROR", detail: err.message }, 401));
        }
        default: {
          return next(new HttpError({ message: "JWT_TOKEN_UNKNOWN_ERROR" }, 401));
        }
      }
    }
  }

  /**
   *  @description -> utility function to return signed jwt with user payload
   */
  signJwt(user) {
    return jwt.sign(
      {
        data: user,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
  }
}

/**
 * @description ->   utility function to mount all routes
 */
function mount(routes) {
  const router = Router();
  router.use(routes.path, routes.router);
  return {
    path: routes.path,
    router: router,
  };
}

module.exports = [mount(new Routes())];
