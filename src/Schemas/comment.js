/**
 *  @description -> JSON Schema for validating comment/create request body data
 */
const create = {
  type: "object",
  properties: {
    content: { type: "string", minLength: 1 },
  },
  required: ["content"],
  additionalProperties: false,
};

module.exports = { create };
