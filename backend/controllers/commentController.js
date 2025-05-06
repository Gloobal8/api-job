const Comment = require("../models/Comment");
const Post = require("../models/Post");

// Get all comments for a post
exports.getCommentsByPostId = async (req, res) => {
  try {
    const postId = req.params.postId;

    // Check if post exists
    const post = Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Get comments
    const comments = Comment.findByPostId(postId);

    res.status(200).json({
      success: true,
      comments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving comments",
      error: error.message,
    });
  }
};

// Create a new comment
exports.createComment = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const postId = req.params.postId;

    // Check if post exists
    const post = Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Prepare comment data
    const commentData = {
      ...req.body,
      postId,
      authorId: req.user.id,
      authorName: `${req.user.firstName} ${req.user.lastName}`,
    };

    // Create comment
    const newComment = Comment.create(commentData);

    res.status(201).json({
      success: true,
      message: "Comment created successfully",
      comment: newComment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating comment",
      error: error.message,
    });
  }
};

// Update a comment
exports.updateComment = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const comment = Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Check if user is authorized (author or admin)
    if (comment.authorId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this comment",
      });
    }

    // Update comment
    const updatedComment = Comment.update(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      comment: updatedComment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating comment",
      error: error.message,
    });
  }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const comment = Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Check if user is authorized (author or admin)
    if (comment.authorId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this comment",
      });
    }

    // Delete comment
    Comment.delete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting comment",
      error: error.message,
    });
  }
};
