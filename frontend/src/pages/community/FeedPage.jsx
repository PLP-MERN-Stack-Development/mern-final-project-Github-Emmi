import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  Heart,
  MessageCircle,
  Send,
  Image as ImageIcon,
  X,
  MoreVertical,
  Trash2,
  Edit,
  Users,
} from 'lucide-react';
import {
  fetchPosts,
  createPost,
  likePost,
  addComment,
  deletePost,
  updatePost,
  addNewPost,
  updatePostLikes,
  addNewComment,
} from '../../redux/slices/feedSlice';
import {
  Card,
  Button,
  Textarea,
  Avatar,
  Badge,
  EmptyState,
  Loader,
  Modal,
  useToast,
} from '../../components/ui';
import socketService from '../../services/socket';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const FeedPage = () => {
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const { posts, loading, error } = useSelector((state) => state.feed);
  const { user } = useSelector((state) => state.auth);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        await dispatch(fetchPosts()).unwrap();
      } catch (err) {
        console.error('Error loading posts:', err);
        addToast(err || 'Failed to load posts', 'error');
      }
    };
    loadPosts();
  }, [dispatch, addToast]);

  // Listen for real-time updates
  useEffect(() => {
    const handleNewPost = (post) => {
      dispatch(addNewPost(post));
    };

    const handlePostLiked = (data) => {
      dispatch(updatePostLikes(data));
    };

    const handleNewComment = (data) => {
      dispatch(addNewComment(data));
    };

    socketService.onNewPost(handleNewPost);
    socketService.onPostLiked(handlePostLiked);
    socketService.onNewComment(handleNewComment);

    return () => {
      socketService.off('newPost', handleNewPost);
      socketService.off('postLiked', handlePostLiked);
      socketService.off('newComment', handleNewComment);
    };
  }, [dispatch]);

  const handleCreatePost = async () => {
    if (!newPostContent.trim() && selectedFiles.length === 0) {
      addToast('Please add some content to your post', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('contentText', newPostContent);
    selectedFiles.forEach((file) => {
      formData.append('media', file);
    });

    try {
      setPosting(true);
      await dispatch(createPost(formData)).unwrap();
      setNewPostContent('');
      setSelectedFiles([]);
      addToast('Post created successfully!', 'success');
    } catch (error) {
      addToast(error || 'Failed to create post', 'error');
    } finally {
      setPosting(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles([...selectedFiles, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Community Feed</h1>
        <p className="text-gray-700 dark:text-gray-300">
          {user?.role === 'student' 
            ? 'Connect with fellow students, share your journey and learn together' 
            : user?.role === 'tutor'
            ? 'Collaborate with fellow tutors and share teaching experiences'
            : 'Share your journey, connect with the community'}
        </p>
      </div>

      {/* Role-based info banner */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded-xl p-4"
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 dark:bg-indigo-800 rounded-lg flex items-center justify-center">
            <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-indigo-900 dark:text-indigo-100 mb-1">
              {user?.role === 'student' ? 'Student Community' : user?.role === 'tutor' ? 'Tutor Community' : 'Your Community'}
            </h3>
            <p className="text-sm text-indigo-800 dark:text-indigo-200">
              {user?.role === 'student' 
                ? 'You\'re viewing posts from fellow students. Share your progress, ask questions, and help each other grow! 🚀' 
                : user?.role === 'tutor'
                ? 'You\'re viewing posts from fellow tutors. Share teaching strategies, collaborate on content, and support each other! 📚'
                : 'Connect and collaborate with your peers in the community.'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Error State */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl"
        >
          {error}
        </motion.div>
      )}

      {/* Create Post */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="mb-6">
          <div className="flex gap-3">
            <Avatar src={user?.avatarUrl || user?.avatar} name={user?.name} size="md" />
            <div className="flex-1">
              <Textarea
                placeholder="Share your thoughts, projects, or questions..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                rows={3}
              />

              {/* Selected Files Preview */}
              {selectedFiles.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt="Preview"
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between mt-3">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                    <ImageIcon className="h-5 w-5" />
                    <span className="text-sm">Add photos</span>
                  </div>
                </label>

                <Button
                  onClick={handleCreatePost}
                  loading={posting}
                  leftIcon={<Send className="h-4 w-4" />}
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Loading State */}
      {loading && <Loader text="Loading feed..." />}

      {/* Empty State */}
      {!loading && posts.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <EmptyState
            icon={MessageCircle}
            title="No posts yet"
            description="Be the first to share something with the community!"
          />
        </motion.div>
      )}

      {/* Posts List */}
      {!loading && Array.isArray(posts) && posts.length > 0 && (
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="space-y-6"
        >
          {posts.map((post) => (
            <motion.div key={post._id} variants={fadeIn}>
              <PostCard post={post} currentUser={user} dispatch={dispatch} addToast={addToast} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

const PostCard = ({ post, currentUser, dispatch, addToast }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isLiked = post.likes?.some((like) => like.user === currentUser._id || like === currentUser._id);
  const isOwner = post.authorId?._id === currentUser._id || post.authorId === currentUser._id;

  const handleLike = async () => {
    try {
      await dispatch(likePost(post._id)).unwrap();
    } catch (error) {
      addToast('Failed to like post', 'error');
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;

    try {
      await dispatch(addComment({ postId: post._id, text: commentText })).unwrap();
      setCommentText('');
      addToast('Comment added', 'success');
    } catch (error) {
      addToast('Failed to add comment', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deletePost(post._id)).unwrap();
      addToast('Post deleted', 'success');
      setShowDeleteModal(false);
    } catch (error) {
      addToast('Failed to delete post', 'error');
    }
  };

  const formatRelativeTime = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffMs = now - postDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return postDate.toLocaleDateString();
  };

  return (
    <Card>
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar src={post.authorId?.avatarUrl || post.authorId?.avatar} name={post.authorId?.name} size="md" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 dark:text-white">{post.authorId?.name || 'Unknown User'}</span>
              {post.authorId?.role === 'tutor' && post.authorId?.verifiedTutor && (
                <Badge variant="primary" className="text-xs">
                  ✓ Tutor
                </Badge>
              )}
              {post.authorId?.role === 'student' && (
                <Badge variant="secondary" className="text-xs">
                  Student
                </Badge>
              )}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{formatRelativeTime(post.createdAt)}</div>
          </div>
        </div>

        {isOwner && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              <MoreVertical className="h-5 w-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 py-1 z-10">
                <button
                  onClick={() => {
                    setShowDeleteModal(true);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Content */}
      <p className="text-gray-900 dark:text-white mb-4 whitespace-pre-wrap">{post.contentText}</p>

      {/* Post Media */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div className={`grid gap-2 mb-4 ${post.mediaUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {post.mediaUrls.map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`Post media ${index + 1}`}
              className="w-full h-64 object-cover rounded-lg"
            />
          ))}
        </div>
      )}

      {/* Post Actions */}
      <div className="flex items-center gap-6 pt-4 border-t border-gray-200 dark:border-slate-700">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 transition ${
            isLiked ? 'text-red-600' : 'text-gray-600 dark:text-gray-400 hover:text-red-600'
          }`}
        >
          <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
          <span className="text-sm font-medium">{post.likes?.length || 0}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="text-sm font-medium">{post.comments?.length || 0}</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
          {/* Comments List */}
          {post.comments && post.comments.length > 0 && (
            <div className="space-y-3 mb-4">
              {post.comments.map((comment) => (
                <div key={comment._id} className="flex gap-3">
                  <Avatar src={comment.authorId?.avatarUrl || comment.authorId?.avatar} name={comment.authorId?.name} size="sm" />
                  <div className="flex-1 bg-gray-50 dark:bg-slate-800 rounded-lg p-3">
                    <div className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
                      {comment.authorId?.name || 'Unknown User'}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Comment */}
          <div className="flex gap-3">
            <Avatar src={currentUser?.avatarUrl || currentUser?.avatar} name={currentUser?.name} size="sm" />
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Button size="sm" onClick={handleComment}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Post"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete this post? This action cannot be undone.</p>
      </Modal>
    </Card>
  );
};

export default FeedPage;
