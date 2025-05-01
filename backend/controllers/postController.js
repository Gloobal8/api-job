const Post = require('../models/Post');
const Category = require('../models/Category');

// Get all posts with pagination and filtering
exports.getAllPosts = async (req, res) => {
  try {
    // Extract query parameters
    const { 
      status = 'published', 
      categoryId, 
      authorId, 
      tag, 
      search,
      page = 1,
      limit = 10,
      sort = 'newest'
    } = req.query;

    // Build filters
    const filters = {};
    
    // Only admin can see unpublished posts
    if (req.user && req.user.role === 'admin') {
      if (status) filters.status = status;
    } else {
      filters.status = 'published';
    }
    
    if (categoryId) filters.categoryId = categoryId;
    if (authorId) filters.authorId = authorId;
    if (tag) filters.tag = tag;
    if (search) filters.search = search;

    // Get all posts with filters
    let posts = Post.findAll(filters);

    // Sort posts
    if (sort === 'newest') {
      posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sort === 'oldest') {
      posts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sort === 'popular') {
      posts.sort((a, b) => b.viewCount - a.viewCount);
    }

    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = posts.length;
    
    // Paginate results
    posts = posts.slice(startIndex, endIndex);

    // Add category information to each post
    posts = posts.map(post => {
      let category = null;
      if (post.categoryId) {
        category = Category.findById(post.categoryId);
        if (category) {
          category = {
            id: category.id,
            name: category.name,
            slug: category.slug
          };
        }
      }
      return { ...post, category };
    });

    res.status(200).json({
      success: true,
      count: posts.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      posts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving posts',
      error: error.message
    });
  }
};

// Get a single post by ID
exports.getPostById = async (req, res) => {
  try {
    const post = Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Only admin can see unpublished posts
    if (post.status !== 'published' && (!req.user || req.user.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Increment view count if it's a public view
    if (post.status === 'published' && (!req.user || req.user.id !== post.authorId)) {
      Post.incrementViewCount(post.id);
    }

    // Add category information
    let category = null;
    if (post.categoryId) {
      category = Category.findById(post.categoryId);
      if (category) {
        category = {
          id: category.id,
          name: category.name,
          slug: category.slug
        };
      }
    }

    res.status(200).json({
      success: true,
      post: { ...post, category }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving post',
      error: error.message
    });
  }
};

// Get a single post by slug
exports.getPostBySlug = async (req, res) => {
  try {
    const post = Post.findBySlug(req.params.slug);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Only admin can see unpublished posts
    if (post.status !== 'published' && (!req.user || req.user.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Increment view count if it's a public view
    if (post.status === 'published' && (!req.user || req.user.id !== post.authorId)) {
      Post.incrementViewCount(post.id);
    }

    // Add category information
    let category = null;
    if (post.categoryId) {
      category = Category.findById(post.categoryId);
      if (category) {
        category = {
          id: category.id,
          name: category.name,
          slug: category.slug
        };
      }
    }

    res.status(200).json({
      success: true,
      post: { ...post, category }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving post',
      error: error.message
    });
  }
};

// Create a new post
exports.createPost = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Prepare post data
    const postData = {
      ...req.body,
      authorId: req.user.id,
      authorName: `${req.user.firstName} ${req.user.lastName}`
    };

    // Create new post
    const newPost = Post.create(postData);

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: newPost
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating post',
      error: error.message
    });
  }
};

// Update a post
exports.updatePost = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const post = Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is authorized (author or admin)
    if (post.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post'
      });
    }

    // Update post
    const updatedPost = Post.update(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      post: updatedPost
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating post',
      error: error.message
    });
  }
};

// Delete a post
exports.deletePost = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const post = Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is authorized (author or admin)
    if (post.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    // Delete post
    Post.delete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting post',
      error: error.message
    });
  }
};

// Publish a post
exports.publishPost = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const post = Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is authorized (author or admin)
    if (post.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to publish this post'
      });
    }

    // Publish post
    const updatedPost = Post.publish(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Post published successfully',
      post: updatedPost
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error publishing post',
      error: error.message
    });
  }
};

// Unpublish a post (set to draft)
exports.unpublishPost = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const post = Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is authorized (author or admin)
    if (post.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to unpublish this post'
      });
    }

    // Unpublish post
    const updatedPost = Post.unpublish(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Post unpublished successfully',
      post: updatedPost
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error unpublishing post',
      error: error.message
    });
  }
};