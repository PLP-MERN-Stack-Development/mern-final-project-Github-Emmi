const Post = require('../models/Post');
const User = require('../models/User');
const { uploadToCloudinary, uploadMultipleToCloudinary } = require('../utils/cloudinaryHelper');

// @desc    Get all posts (community feed)
// @route   GET /api/feeds
// @access  Private (role-based filtering)
exports.getPosts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      visibility = 'public',
      courseId,
      authorId
    } = req.query;

    // Build query
    const query = { isHidden: false };

    if (visibility) {
      query.visibility = visibility;
    }

    if (courseId) {
      query.courseId = courseId;
    }

    if (authorId) {
      query.authorId = authorId;
    }

    // Role-based filtering: Students see student posts, Tutors see tutor posts
    if (req.user) {
      // First, get all authors with the same role as the current user
      const sameRoleUsers = await User.find({ role: req.user.role }).select('_id');
      const sameRoleUserIds = sameRoleUsers.map(u => u._id);
      
      // Filter posts to only show posts from users with the same role
      query.authorId = { $in: sameRoleUserIds };
    }

    // Execute query
    const posts = await Post.find(query)
      .populate('authorId', 'name email avatarUrl role verifiedTutor')
      .populate('comments.authorId', 'name avatarUrl role')
      .populate('courseId', 'title')
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Get total count
    const count = await Post.countDocuments(query);

    // Add like status for authenticated users
    if (req.user) {
      posts.forEach(post => {
        post.isLiked = post.likes.some(
          likeId => likeId.toString() === req.user.id
        );
        post.likesCount = post.likes.length;
        post.commentsCount = post.comments.length;
      });
    }

    res.status(200).json({
      success: true,
      count: posts.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      data: posts
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching posts',
      error: error.message
    });
  }
};

// @desc    Get single post
// @route   GET /api/feeds/:id
// @access  Public
exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('authorId', 'name email avatarUrl role verifiedTutor')
      .populate('comments.authorId', 'name avatarUrl')
      .populate('courseId', 'title');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user liked
    let isLiked = false;
    if (req.user) {
      isLiked = post.likes.some(likeId => likeId.toString() === req.user.id);
    }

    res.status(200).json({
      success: true,
      data: post,
      isLiked
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching post',
      error: error.message
    });
  }
};

// @desc    Create new post
// @route   POST /api/feeds
// @access  Private
exports.createPost = async (req, res) => {
  try {
    const { contentText, visibility, courseId, hashtags } = req.body;

    if (!contentText || contentText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Post content is required'
      });
    }

    // Handle media uploads
    let media = [];
    if (req.files && req.files.length > 0) {
      const uploadedFiles = await uploadMultipleToCloudinary(req.files, 'posts');
      media = uploadedFiles.map((file, index) => ({
        url: file.url,
        type: file.resourceType === 'video' ? 'video' : 'image',
        cloudinaryId: file.cloudinaryId
      }));
    }

    // Extract hashtags from content
    const hashtagRegex = /#(\w+)/g;
    const extractedHashtags = [...contentText.matchAll(hashtagRegex)].map(m => m[1]);
    const allHashtags = [...new Set([...(hashtags || []), ...extractedHashtags])];

    // Extract mentions from content
    const mentionRegex = /@(\w+)/g;
    const mentions = [...contentText.matchAll(mentionRegex)].map(m => m[1]);
    
    // Find mentioned users
    const mentionedUsers = await User.find({
      name: { $in: mentions }
    }).select('_id');

    // Create post
    const post = await Post.create({
      authorId: req.user.id,
      contentText,
      media,
      visibility: visibility || 'public',
      courseId: courseId || null,
      hashtags: allHashtags,
      mentions: mentionedUsers.map(u => u._id)
    });

    await post.populate('authorId', 'name email avatarUrl role verifiedTutor');

    // Track achievement progress
    const { checkAndUnlockAchievements } = require('./achievementController');
    const StudentActivity = require('../models/StudentActivity');
    
    // Create activity record
    await StudentActivity.create({
      userId: req.user.id,
      activityType: 'post_created',
      title: 'Community Post Created',
      description: contentText.substring(0, 100) + (contentText.length > 100 ? '...' : ''),
      icon: '💬',
      metadata: {
        postId: post._id
      }
    });

    // Check for new achievements
    await checkAndUnlockAchievements(req.user.id, 'post_created', {
      postId: post._id
    });

    // TODO: Emit socket event for real-time update
    // io.emit('newPost', post);

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: post
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating post',
      error: error.message
    });
  }
};

// @desc    Update post
// @route   PUT /api/feeds/:id
// @access  Private (Author only)
exports.updatePost = async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check ownership
    if (post.authorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post'
      });
    }

    const { contentText } = req.body;

    if (contentText) {
      post.contentText = contentText;
      post.isEdited = true;
      post.editedAt = Date.now();

      // Re-extract hashtags
      const hashtagRegex = /#(\w+)/g;
      const extractedHashtags = [...contentText.matchAll(hashtagRegex)].map(m => m[1]);
      post.hashtags = [...new Set(extractedHashtags)];
    }

    await post.save();

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: post
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating post',
      error: error.message
    });
  }
};

// @desc    Delete post
// @route   DELETE /api/feeds/:id
// @access  Private (Author or Admin)
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check ownership
    if (post.authorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting post',
      error: error.message
    });
  }
};

// @desc    Like/Unlike post
// @route   POST /api/feeds/:id/like
// @access  Private
exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const likeIndex = post.likes.indexOf(req.user.id);

    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
    } else {
      // Like
      post.likes.push(req.user.id);

      // Notify post author if not self-like
      if (post.authorId.toString() !== req.user.id) {
        const Notification = require('../models/Notification');
        await Notification.create({
          userId: post.authorId,
          type: 'post_like',
          title: 'New Like',
          message: `${req.user.name} liked your post`,
          metadata: {
            postId: post._id,
            fromUserId: req.user.id
          }
        });
      }
    }

    await post.save();

    // Populate author info for response
    await post.populate('authorId', 'name email avatarUrl role verifiedTutor');

    res.status(200).json({
      success: true,
      message: likeIndex > -1 ? 'Post unliked' : 'Post liked',
      data: post
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling like',
      error: error.message
    });
  }
};

// @desc    Add comment to post
// @route   POST /api/feeds/:id/comment
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    post.comments.push({
      authorId: req.user.id,
      text,
      createdAt: Date.now()
    });

    await post.save();

    await post.populate('comments.authorId', 'name avatarUrl');

    // Notify post author
    if (post.authorId.toString() !== req.user.id) {
      const Notification = require('../models/Notification');
      await Notification.create({
        userId: post.authorId,
        type: 'post_comment',
        title: 'New Comment',
        message: `${req.user.name} commented on your post`,
        metadata: {
          postId: post._id,
          fromUserId: req.user.id
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: post.comments[post.comments.length - 1]
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding comment',
      error: error.message
    });
  }
};

// @desc    Delete comment
// @route   DELETE /api/feeds/:postId/comment/:commentId
// @access  Private (Comment author or Post author or Admin)
exports.deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check authorization
    const isCommentAuthor = comment.authorId.toString() === req.user.id;
    const isPostAuthor = post.authorId.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isCommentAuthor && !isPostAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }

    comment.deleteOne();
    await post.save();

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting comment',
      error: error.message
    });
  }
};
