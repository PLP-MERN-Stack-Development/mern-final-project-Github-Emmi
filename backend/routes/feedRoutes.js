const express = require('express');
const router = express.Router();
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  deleteComment
} = require('../controllers/feedController');
const { protect, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public/Optional auth routes
router.get('/', optionalAuth, getPosts);
router.get('/:id', optionalAuth, getPost);

// Protected routes
router.post('/', protect, upload.array('media', 5), createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/comment', protect, addComment);
router.delete('/:postId/comment/:commentId', protect, deleteComment);

module.exports = router;
