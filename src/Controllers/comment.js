const HttpError = require("../Util/httpError");
const db = require("../Util/database");

/**
 *  @description -> This controller class implements all the handlers
 *                  for /comment subroutes
 */
class CommentController {
  /**
   *  @description -> creates a comment for a blog
   */
  async create(req, res, next) {
    try {
      const { content } = req.body;
      const { user_id, post_id } = req.params;
      const [{ insertId: comment_id }] = await db.query(
        `
                                       
                INSERT INTO comments (user_id, post_id, content)
                           VALUES (?, ?, ?)`,

        [user_id, post_id, content]
      );

      return res.status(201).json({ message: "CREATED", user_id, post_id, comment_id, content });
    } catch (err) {
      console.log(err);
      next(new HttpError(err));
    }
  }
}

module.exports = CommentController;
