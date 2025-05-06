const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const slugify = require("slugify");

// Path to the file that will store the posts
const DB_PATH = path.join(__dirname, "../data/db.json");

// Ensure the data directory and file exist
if (!fs.existsSync(path.dirname(DB_PATH))) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH), JSON.stringify([]);
}

class Post {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.title = data.title;
    this.content = data.content;
    this.slug = data.slug || this.generateSlug(data.title);
    this.authorId = data.authorId;
    this.authorName = data.authorName;
    this.categoryId = data.categoryId;
    this.tags = data.tags || [];
    this.status = data.status || "draft"; // draft, published, archived
    this.featuredImage = data.featuredImage || null;
    this.metaDescription = data.metaDescription || "";
    this.viewCount = data.viewCount || 0;
    this.publishedAt = data.publishedAt || null;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // Validate post data
  static validatePost(data) {
    const errors = [];

    if (!data.title || typeof data.title !== "string") {
      errors.push("Title is required and must be a string");
    }

    if (!data.content || typeof data.content !== "string") {
      errors.push("Content is required and must be a string");
    }

    if (!data.authorId) {
      errors.push("Author ID is required");
    }

    if (
      data.status &&
      !["draft", "published", "archived"].includes(data.status)
    ) {
      errors.push("Status must be one of: draft, published, archived");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Generate a slug from the title
  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with a single one
      .trim();
  }

  // Ensure the slug is unique
  static ensureUniqueSlug(slug, id = null) {
    const posts = JSON.parse(fs.readFileSync(dataPath));
    let isUnique = true;
    let counter = 1;
    let newSlug = slug;

    while (!isUnique) {
      isUnique = !posts.some((post) => post.slug === newSlug && post.id !== id);
      if (!isUnique) {
        newSlug = `${slug}-${counter}`;
        counter++;
      }
    }

    return newSlug;
  }

  // Get all posts with optional filtering
  static findAll(filters = {}) {
    try {
      const data = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
      let posts = data.posts || [];

      // Apply filters
      if (filters.status) {
        posts = posts.filter((post) => post.status === filters.status);
      }

      if (filters.categoryId) {
        posts = posts.filter((post) => post.categoryId === filters.categoryId);
      }

      if (filters.authorId) {
        posts = posts.filter((post) => post.authorId === filters.authorId);
      }

      if (filters.tag) {
        posts = posts.filter(
          (post) => post.tags && post.tags.includes(filters.tag)
        );
      }

      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        posts = posts.filter(
          (post) =>
            post.title.toLowerCase().includes(searchTerm) ||
            post.content.toLowerCase().includes(searchTerm)
        );
      }

      return posts;
    } catch (error) {
      console.error("Error reading database:", error);
      return [];
    }
  }

  // Get a post by ID
  static findById(id) {
    try {
      const data = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
      return (data.posts || []).find((post) => post.id === id);
    } catch (error) {
      console.error("Error reading database:", error);
      return null;
    }
  }

  // Get a post by slug
  static findBySlug(slug) {
    try {
      const data = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
      return (data.posts || []).find((post) => post.slug === slug);
    } catch (error) {
      console.error("Error reading database:", error);
      return null;
    }
  }

  // Create a new post
  static create(postData) {
    try {
      const data = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));

      // Generate ID and slug
      const id = uuidv4();
      const slug =
        postData.slug || slugify(postData.title, { lower: true, strict: true });

      // Set default values
      const now = new Date().toISOString();
      const newPost = {
        id,
        slug,
        title: postData.title,
        content: postData.content,
        categoryId: postData.categoryId || null,
        tags: postData.tags || [],
        status: postData.status || "draft",
        featuredImage: postData.featuredImage || null,
        metaDescription: postData.metaDescription || "",
        authorId: postData.authorId,
        authorName: postData.authorName,
        createdAt: now,
        updatedAt: now,
        publishedAt: postData.status === "published" ? now : null,
        viewCount: 0,
      };

      // Add to database
      if (!data.posts) data.posts = [];
      data.posts.push(newPost);

      // Save to database
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");

      return newPost;
    } catch (error) {
      console.error("Error creating post:", error);
      throw new Error("Failed to create post");
    }
  }

  // Update a post
  static update(id, postData) {
    try {
      const data = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
      const posts = data.posts || [];
      const postIndex = posts.findIndex((post) => post.id === id);

      if (postIndex === -1) {
        throw new Error("Post not found");
      }

      // Update post
      const updatedPost = {
        ...posts[postIndex],
        ...postData,
        updatedAt: new Date().toISOString(),
      };

      // Generate slug if title changed and slug not provided
      if (
        postData.title &&
        !postData.slug &&
        postData.title !== posts[postIndex].title
      ) {
        updatedPost.slug = slugify(postData.title, {
          lower: true,
          strict: true,
        });
      }

      // Update publishedAt if status changed to published
      if (
        postData.status === "published" &&
        posts[postIndex].status !== "published"
      ) {
        updatedPost.publishedAt = new Date().toISOString();
      }

      // Update in database
      posts[postIndex] = updatedPost;
      data.posts = posts;
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");

      return updatedPost;
    } catch (error) {
      console.error("Error updating post:", error);
      throw new Error("Failed to update post");
    }
  }

  // Delete a post
  static delete(id) {
    try {
      const data = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
      const posts = data.posts || [];
      const postIndex = posts.findIndex((post) => post.id === id);

      if (postIndex === -1) {
        throw new Error("Post not found");
      }

      // Remove from database
      posts.splice(postIndex, 1);
      data.posts = posts;
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");

      return true;
    } catch (error) {
      console.error("Error deleting post:", error);
      throw new Error("Failed to delete post");
    }
  }

  // Publish a post
  static publish(id) {
    try {
      const data = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
      const posts = data.posts || [];
      const postIndex = posts.findIndex((post) => post.id === id);

      if (postIndex === -1) {
        throw new Error("Post not found");
      }

      // Update post
      posts[postIndex].status = "published";
      posts[postIndex].publishedAt = new Date().toISOString();
      posts[postIndex].updatedAt = new Date().toISOString();

      // Save to database
      data.posts = posts;
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");

      return posts[postIndex];
    } catch (error) {
      console.error("Error publishing post:", error);
      throw new Error("Failed to publish post");
    }
  }

  // Unpublish a post (set to draft)
  static unpublish(id) {
    try {
      const data = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
      const posts = data.posts || [];
      const postIndex = posts.findIndex((post) => post.id === id);

      if (postIndex === -1) {
        throw new Error("Post not found");
      }

      // Update post
      posts[postIndex].status = "draft";
      posts[postIndex].updatedAt = new Date().toISOString();

      // Save to database
      data.posts = posts;
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");

      return posts[postIndex];
    } catch (error) {
      console.error("Error unpublishing post:", error);
      throw new Error("Failed to unpublish post");
    }
  }

  // Archive a post
  static archive(id) {
    const post = this.findById(id);
    if (!post) {
      throw new Error("Post not found");
    }

    return this.update(id, {
      status: "archived",
    });
  }

  // Increment view count
  static incrementViewCount(id) {
    try {
      const data = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
      const posts = data.posts || [];
      const postIndex = posts.findIndex((post) => post.id === id);

      if (postIndex === -1) {
        throw new Error("Post not found");
      }

      // Increment view count
      posts[postIndex].viewCount = (posts[postIndex].viewCount || 0) + 1;

      // Save to database
      data.posts = posts;
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");

      return posts[postIndex];
    } catch (error) {
      console.error("Error incrementing view count:", error);
      return null;
    }
  }

  // Get published posts
  static getPublished() {
    return this.findAll({ status: "published" });
  }

  // Get posts by category
  static getByCategory(categoryId) {
    return this.findAll({ categoryId, status: "published" });
  }

  // Get posts by author
  static getByAuthor(authorId) {
    return this.findAll({ authorId });
  }

  // Get posts by tag
  static getByTag(tag) {
    return this.findAll({ tag, status: "published" });
  }

  // Search posts
  static search(query) {
    return this.findAll({ search: query, status: "published" });
  }
}

module.exports = Post;
