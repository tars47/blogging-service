/**
 *  @description -> JSON Schema for validating post/create request body data
 */
const create = {
  type: "object",
  properties: {
    title: { type: "string", minLength: 1, maxLength: 255, pattern: "^[a-zA-Z ,]+$" },
    description: { type: "string", minLength: 1 },
  },
  required: ["title", "description"],
  additionalProperties: false,
};

module.exports = { create };
