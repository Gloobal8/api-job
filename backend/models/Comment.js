const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const DB_PATH = path.join(__dirname, "../data/db.json");

class Comment {
  static findByPostId(postId) {
    try {
      const data = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
      return (data.comments || []).filter(
        (comment) => comment.postId === postId
      );
    } catch (error) {
      console.error("Error reading database:", error);
      return [];
    }
  }

  static create(commentData) {
    try {
      const data = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));

      // Generate ID
      const id = uuidv4();

      // Set default values
      const now = new Date().toISOString();
      const newComment = {
        id,
        postId: commentData.postId,
        content: commentData.content,
        authorId: commentData.authorId,
        authorName: commentData.authorName,
        parentId: commentData.parentId || null,
        createdAt: now,
        updatedAt: now,
      };

      // Add to database
      if (!data.comments) data.comments = [];
      data.comments.push(newComment);

      // Save to database
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");

      return newComment;
    } catch (error) {
      console.error("Error creating comment:", error);
      throw new Error("Failed to create comment");
    }
  }

  static update(id, commentData) {
    try {
      const data = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
      const comments = data.comments || [];
      const commentIndex = comments.findIndex((comment) => comment.id === id);

      if (commentIndex === -1) {
        throw new Error("Comment not found");
      }

      // Update comment
      comments[commentIndex] = {
        ...comments[commentIndex],
        content: commentData.content,
        updatedAt: new Date().toISOString(),
      };

      // Save to database
      data.comments = comments;
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");

      return comments[commentIndex];
    } catch (error) {
      console.error("Error updating comment:", error);
      throw new Error("Failed to update comment");
    }
  }

  static delete(id) {
    try {
      const data = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
      const comments = data.comments || [];
      const commentIndex = comments.findIndex((comment) => comment.id === id);

      if (commentIndex === -1) {
        throw new Error("Comment not found");
      }

      // Remove from database
      comments.splice(commentIndex, 1);
      data.comments = comments;
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");

      return true;
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw new Error("Failed to delete comment");
    }
  }
}

module.exports = Comment;
