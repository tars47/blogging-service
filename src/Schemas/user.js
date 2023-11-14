/**
 *  @description -> JSON Schema for validating user/register request body data
 */
const register = {
  type: "object",
  properties: {
    email: { type: "string", minLength: 1, maxLength: 255, format: "email" },
    password: { type: "string", minLength: 1, maxLength: 255 },
    username: { type: "string", minLength: 1, maxLength: 255, pattern: "^[a-zA-Z0-9]+$" },
  },
  required: ["email", "password", "username"],
  additionalProperties: false,
};

/**
 *  @description -> JSON Schema for validating user/login request body data
 */
const login = {
  type: "object",
  properties: {
    password: { type: "string", minLength: 1, maxLength: 255 },
    username: { type: "string", minLength: 1, maxLength: 255, pattern: "^[a-zA-Z0-9]+$" },
  },
  required: ["password", "username"],
  additionalProperties: false,
};

module.exports = { register, login };
