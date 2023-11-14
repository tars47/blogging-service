const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const HttpError = require("../Util/httpError");
const { register, login } = require("../Schemas/user");
const { create } = require("../Schemas/post");
const { create: createComment } = require("../Schemas/comment");

/**
 *  @description -> This class is used to validate the request body against the schema.
 */
class Validation extends Ajv {
  /**
   *  @description -> Creates an instance of Validation
   */
  constructor() {
    super({
      allErrors: true,
    });
    addFormats(this);
  }

  /**
   *  @description -> This function is used to add auth schemas
   */
  addUserSchemas() {
    this.addSchema(register, "/user/register");
    this.addSchema(login, "/user/login");
    return this;
  }

  addPostSchemas() {
    this.addSchema(create, "/user/:user_id/post");
    return this;
  }

  addCommentSchemas() {
    this.addSchema(createComment, "/user/:user_id/post/:post_id/comment");
    return this;
  }

  /**
   *  @description -> Utility method that calls all route methods
   */
  addAllSchemas() {
    this.addUserSchemas();
    this.addPostSchemas();
    this.addCommentSchemas();
    return this;
  }

  /**
   *  @description -> Middleware function that validates the request body against the schema.
   */
  Validate(req, res, next) {
    const httpMethod = req.method;
    console.log(req.baseUrl, req.path, req.route.path);
    const validate = this.getSchema(`${req.baseUrl}${req.route.path}`);
    let data;
    switch (httpMethod) {
      case "GET":
      case "DELETE": {
        data = req.query;
        break;
      }
      case "PUT":
      case "POST":
      case "PATCH": {
        data = req.body;
        break;
      }
    }
    if (validate?.(data)) {
      next();
    } else {
      next(new HttpError(validate?.errors, 400));
    }
  }

  /**
   *  @description -> Static method that initializes the Validation class and returns the Validate function.
   */
  static init() {
    const _ = new Validation().addAllSchemas();
    return _.Validate.bind(_);
  }
}

module.exports = Validation.init();
