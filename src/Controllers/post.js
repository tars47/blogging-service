const HttpError = require("../Util/httpError");
const db = require("../Util/database");

/**
 *  @description -> This controller class implements all
 *                  the handlers for /post subroutes
 */
class PostController {
  /**
   *  @description -> creates a user blog post
   */
  async create(req, res, next) {
    try {
      const { title, description } = req.body;
      const { user_id } = req.params;
      const [{ insertId: post_id }] = await db.query(
        `                     
                INSERT INTO posts (
                    user_id, 
                    title, 
                    description)
                VALUES (?, ?, ?)`,

        [user_id, title, description]
      );

      return res.status(201).json({ message: "CREATED", post_id, title, description });
    } catch (err) {
      next(new HttpError(err));
    }
  }

  /**
   *  @description -> list all users blog posts
   */
  async list(req, res, next) {
    try {
      const { user_id } = req.params;
      const [posts] = await db.query(
        `                      
                SELECT post_id, 
                       title, 
                       description 
                FROM posts 
                WHERE user_id=?`,

        [user_id]
      );

      return res.status(200).json({ user_id, posts });
    } catch (err) {
      next(new HttpError(err));
    }
  }

  /**
   *  @description -> gets a users blog details.
   * 
   *  @comments -> I decided to use two queries instead of one JOIN query
   *               because, in one join query we will get same user and post
   *               data on all the rows, assuming that post description
   *               is a large piece of text, having all these duplicate
   *               data will be huge and unnecessary overhead on the network
   *               
   *                SELECT U.user_id, U.username, 
                           P.post_id, P.title as post_title, 
                           P.description as post_description, 
                           C.comment_id, C.content as comment_content 
                    FROM posts P
                    JOIN users U
                      ON U.user_id = P.user_id
                    JOIN comments C
                      ON P.post_id = C.post_id
                    WHERE P.user_id = ? AND P.post_id = ?
   */
  async view(req, res, next) {
    try {
      const { user_id, post_id } = req.params;
      const [postData] = await db.query(
        `    
            SELECT U.user_id, U.username, 
                   P.post_id, P.title as post_title, 
                   P.description as post_description
            FROM posts P
            JOIN users U
              ON U.user_id = P.user_id
            WHERE P.user_id = ? AND P.post_id = ?                      
                `,

        [user_id, post_id]
      );

      if (postData.length === 0) {
        next(
          new HttpError(
            {
              message: "INVALID_POST_ID",
              detail: `post id: ${post_id} does not exist`,
            },
            404
          )
        );
      }

      let response = {
        username: postData[0].username,
        user_id: postData[0].user_id,
        post_id: postData[0].post_id,
        post_title: postData[0].post_title,
        post_description: postData[0].post_description,
      };

      const [commentData] = await db.query(
        `    
              SELECT U.user_id, U.username,
                     C.comment_id, C.content as comment_content 
              FROM comments C
              JOIN users U
                ON C.user_id = U.user_id
              WHERE C.post_id = ?`,

        [post_id]
      );

      response.comments = commentData;

      return res.status(200).json(response);
    } catch (err) {
      console.log(err);
      next(new HttpError(err));
    }
  }
}

module.exports = PostController;
