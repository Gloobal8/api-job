const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Path to the file that will store the posts
const dataPath = path.join(__dirname, '../data/posts.json');

// Ensure the data directory and file exist
if (!fs.existsSync(path.dirname(dataPath))) {
  fs.mkdirSync(path.dirname(dataPath), { recursive: true });
}

if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath, JSON.stringify([]));
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
    this.status = data.status || 'draft'; // draft, published, archived
    this.featuredImage = data.featuredImage || null;
    this.metaDescription = data.metaDescription || '';
    this.viewCount = data.viewCount || 0;
    this.publishedAt = data.publishedAt || null;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // Validate post data
  static validatePost(data) {
    const errors = [];

    if (!data.title || typeof data.title !== 'string') {
      errors.push('Title is required and must be a string');
    }

    if (!data.content || typeof data.content !== 'string') {
      errors.push('Content is required and must be a string');
    }

    if (!data.authorId) {
      errors.push('Author ID is required');
    }

    if (data.status && !['draft', 'published', 'archived'].includes(data.status)) {
      errors.push('Status must be one of: draft, published, archived');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Generate a slug from the title
  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with a single one
      .trim();
  }

  // Ensure the slug is unique
  static ensureUniqueSlug(slug, id = null) {
    const posts = JSON.parse(fs.readFileSync(dataPath));
    let isUnique = true;
    let counter = 1;
    let newSlug = slug;

    while (!isUnique) {
      isUnique = !posts.some(post => post.slug === newSlug && post.id !== id);
      if (!isUnique) {
        newSlug = `${slug}-${counter}`;
        counter++;
      }
    }

    return newSlug;
  }

  // Get all posts with optional filtering
  static findAll(filters = {}) {
    const posts = JSON.parse(fs.readFileSync(dataPath));
    
    return posts.filter(post => {
      // Filter by status
      if (filters.status && post.status !== filters.status) {
        return false;
      }
      
      // Filter by category
      if (filters.categoryId && post.categoryId !== filters.categoryId) {
        return false;
      }
      
      // Filter by author
      if (filters.authorId && post.authorId !== filters.authorId) {
        return false;
      }
      
      // Filter by tag
      if (filters.tag && !post.tags.includes(filters.tag)) {
        return false;
      }
      
      // Filter by search term (title or content)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return post.title.toLowerCase().includes(searchLower) || 
               post.content.toLowerCase().includes(searchLower);
      }
      
      return true;
    });
  }

  // Get a post by ID
  static findById(id) {
    const posts = JSON.parse(fs.readFileSync(dataPath));
    return posts.find(post => post.id === id);
  }

  // Get a post by slug
  static findBySlug(slug) {
    const posts = JSON.parse(fs.readFileSync(dataPath));
    return posts.find(post => post.slug === slug);
  }

  // Create a new post
  static create(data) {
    const validation = this.validatePost(data);
    if (!validation.valid) {
      throw new Error(`Invalid post data: ${validation.errors.join(', ')}`);
    }

    const posts = JSON.parse(fs.readFileSync(dataPath));
    
    // Ensure slug is unique
    data.slug = this.ensureUniqueSlug(data.slug || this.prototype.generateSlug(data.title));
    
    const newPost = new Post(data);
    posts.push(newPost);
    
    fs.writeFileSync(dataPath, JSON.stringify(posts, null, 2));
    return newPost;
  }

  // Update a post
  static update(id, data) {
    const posts = JSON.parse(fs.readFileSync(dataPath));
    const index = posts.findIndex(post => post.id === id);
    
    if (index === -1) {
      throw new Error('Post not found');
    }
    
    // If title is being updated, regenerate slug
    if (data.title && data.title !== posts[index].title) {
      data.slug = this.ensureUniqueSlug(
        data.slug || this.prototype.generateSlug(data.title),
        id
      );
    }
    
    // Update the post
    const updatedPost = {
      ...posts[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    posts[index] = updatedPost;
    fs.writeFileSync(dataPath, JSON.stringify(posts, null, 2));
    
    return updatedPost;
  }

  // Delete a post
  static delete(id) {
    const posts = JSON.parse(fs.readFileSync(dataPath));
    const index = posts.findIndex(post => post.id === id);
    
    if (index === -1) {
      throw new Error('Post not found');
    }
    
    posts.splice(index, 1);
    fs.writeFileSync(dataPath, JSON.stringify(posts, null, 2));
    
    return { success: true };
  }

  // Publish a post
  static publish(id) {
    const post = this.findById(id);
    if (!post) {
      throw new Error('Post not found');
    }
    
    return this.update(id, {
      status: 'published',
      publishedAt: new Date().toISOString()
    });
  }

  // Unpublish a post (set to draft)
  static unpublish(id) {
    const post = this.findById(id);
    if (!post) {
      throw new Error('Post not found');
    }
    
    return this.update(id, {
      status: 'draft'
    });
  }

  // Archive a post
  static archive(id) {
    const post = this.findById(id);
    if (!post) {
      throw new Error('Post not found');
    }
    
    return this.update(id, {
      status: 'archived'
    });
  }

  // Increment view count
  static incrementViewCount(id) {
    const post = this.findById(id);
    if (!post) {
      throw new Error('Post not found');
    }
    
    return this.update(id, {
      viewCount: post.viewCount + 1
    });
  }

  // Get published posts
  static getPublished() {
    return this.findAll({ status: 'published' });
  }

  // Get posts by category
  static getByCategory(categoryId) {
    return this.findAll({ categoryId, status: 'published' });
  }

  // Get posts by author
  static getByAuthor(authorId) {
    return this.findAll({ authorId });
  }

  // Get posts by tag
  static getByTag(tag) {
    return this.findAll({ tag, status: 'published' });
  }

  // Search posts
  static search(query) {
    return this.findAll({ search: query, status: 'published' });
  }
}

module.exports = Post;