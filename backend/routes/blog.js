const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const commentController = require("../controllers/commentController");
const categoryController = require("../controllers/categoryController");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

// Import controllers
// We'll define these controllers later, for now we'll use placeholders
/*const postController = {
  getAllPosts: (req, res) => {
    res.json({ message: "Get all posts" });
  },
  getPostById: (req, res) => {
    res.json({ message: `Get post with ID: ${req.params.id}` });
  },
  createPost: (req, res) => {
    res.json({ message: "Create new post", data: req.body });
  },
  updatePost: (req, res) => {
    res.json({
      message: `Update post with ID: ${req.params.id}`,
      data: req.body,
    });
  },
  deletePost: (req, res) => {
    res.json({ message: `Delete post with ID: ${req.params.id}` });
  },
};

const categoryController = {
  getAllCategories: (req, res) => {
    res.json({ message: "Get all categories" });
  },
  getCategoryById: (req, res) => {
    res.json({ message: `Get category with ID: ${req.params.id}` });
  },
  createCategory: (req, res) => {
    res.json({ message: "Create new category", data: req.body });
  },
  updateCategory: (req, res) => {
    res.json({
      message: `Update category with ID: ${req.params.id}`,
      data: req.body,
    });
  },
  deleteCategory: (req, res) => {
    res.json({ message: `Delete category with ID: ${req.params.id}` });
  },
};

const commentController = {
  getCommentsByPost: (req, res) => {
    res.json({
      message: `Get comments for post with ID: ${req.params.postId}`,
    });
  },
  createComment: (req, res) => {
    res.json({
      message: `Create comment for post with ID: ${req.params.postId}`,
      data: req.body,
    });
  },
  updateComment: (req, res) => {
    res.json({
      message: `Update comment with ID: ${req.params.id}`,
      data: req.body,
    });
  },
  deleteComment: (req, res) => {
    res.json({ message: `Delete comment with ID: ${req.params.id}` });
  },
  approveComment: (req, res) => {
    res.json({ message: `Approve comment with ID: ${req.params.id}` });
  },
};*/

// Post routes
router.get("/posts", postController.getAllPosts);
router.get("/posts/:id", postController.getPostById);
router.get("/posts/slug/:slug", postController.getPostBySlug);
router.post("/posts", verifyToken, postController.createPost);
router.put("/posts/:id", verifyToken, postController.updatePost);
router.delete("/posts/:id", verifyToken, postController.deletePost);
router.put("/posts/:id/publish", verifyToken, postController.publishPost);
router.put("/posts/:id/unpublish", verifyToken, postController.unpublishPost);

// Comment routes
router.get("/posts/:postId/comments", commentController.getCommentsByPostId);
router.post(
  "/posts/:postId/comments",
  verifyToken,
  commentController.createComment
);
router.put("/comments/:id", verifyToken, commentController.updateComment);
router.delete("/comments/:id", verifyToken, commentController.deleteComment);
/*router.patch(
  "/comments/:id/approve",
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  commentController.approveComment
);*/

// Category routes
router.get("/categories", categoryController.getAllCategories);
router.get("/categories/:id", categoryController.getCategoryById);
router.get("/categories/slug/:slug", categoryController.getCategoryBySlug);
router.post(
  "/categories",
  verifyToken,
  isAdmin,
  categoryController.createCategory
);
router.put(
  "/categories/:id",
  verifyToken,
  isAdmin,
  categoryController.updateCategory
);
router.delete(
  "/categories/:id",
  verifyToken,
  isAdmin,
  categoryController.deleteCategory
);

module.exports = router;
