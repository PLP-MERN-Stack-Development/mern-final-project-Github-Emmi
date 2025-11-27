import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
  MessageSquare,
  Search,
  EyeOff,
  Eye,
  ThumbsUp,
  MessageCircle,
  AlertTriangle,
} from 'lucide-react';
import {
  fetchAllPosts,
  moderatePost,
} from '../../redux/slices/adminSlice';
import {
  Card,
  Button,
  Input,
  Select,
  Modal,
  Avatar,
  Badge,
  Loader,
  EmptyState,
  useToast,
} from '../../components/ui';

const FeedModerationPage = () => {
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const { posts } = useSelector((state) => state.admin);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
  });

  const [showModerateModal, setShowModerateModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [moderationReason, setModerationReason] = useState('');

  useEffect(() => {
    dispatch(fetchAllPosts(filters));
  }, [dispatch, filters]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update URL params
    const params = {};
    Object.keys(newFilters).forEach((k) => {
      if (newFilters[k]) params[k] = newFilters[k];
    });
    setSearchParams(params);
  };

  const handleModeratePost = async (hide) => {
    if (hide && !moderationReason.trim()) {
      addToast('Please provide a reason for hiding this post', 'error');
      return;
    }

    try {
      await dispatch(
        moderatePost({
          postId: selectedPost._id,
          isHidden: hide,
          moderationReason: hide ? moderationReason : null,
        })
      ).unwrap();
      addToast(
        hide ? 'Post hidden successfully!' : 'Post unhidden successfully!',
        'success'
      );
      setShowModerateModal(false);
      setSelectedPost(null);
      setModerationReason('');
    } catch (error) {
      addToast(error || 'Failed to moderate post', 'error');
    }
  };

  const quickHide = async (post) => {
    try {
      await dispatch(
        moderatePost({
          postId: post._id,
          isHidden: !post.isHidden,
          moderationReason: post.isHidden
            ? null
            : 'Quick moderation by admin',
        })
      ).unwrap();
      addToast(
        post.isHidden ? 'Post unhidden!' : 'Post hidden!',
        'success'
      );
    } catch (error) {
      addToast(error || 'Failed to moderate post', 'error');
    }
  };

  // Calculate stats
  const stats = {
    total: posts.total || 0,
    visible: posts.list.filter((p) => !p.isHidden).length,
    hidden: posts.list.filter((p) => p.isHidden).length,
    totalLikes: posts.list.reduce((sum, p) => sum + (p.likes?.length || 0), 0),
    totalComments: posts.list.reduce(
      (sum, p) => sum + (p.comments?.length || 0),
      0
    ),
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <MessageSquare className="w-8 h-8" />
              Feed Moderation
            </h1>
            <p className="text-gray-600 mt-1">
              Monitor and moderate community posts
            </p>
          </div>
          <Badge variant="warning" className="text-sm">
            {stats.hidden} Hidden Posts
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Posts</p>
                <p className="text-3xl font-bold mt-1">{stats.total}</p>
              </div>
              <MessageSquare className="w-12 h-12 text-blue-200" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Visible</p>
                <p className="text-3xl font-bold mt-1">{stats.visible}</p>
              </div>
              <Eye className="w-12 h-12 text-green-200" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Hidden</p>
                <p className="text-3xl font-bold mt-1">{stats.hidden}</p>
              </div>
              <EyeOff className="w-12 h-12 text-red-200" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total Engagement</p>
                <p className="text-3xl font-bold mt-1">
                  {stats.totalLikes + stats.totalComments}
                </p>
              </div>
              <ThumbsUp className="w-12 h-12 text-purple-200" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by content or author..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Posts</option>
              <option value="visible">Visible Only</option>
              <option value="hidden">Hidden Only</option>
            </Select>
          </div>
        </Card>

        {/* Posts Grid */}
        <div className="space-y-4">
          {posts.loading && posts.list.length === 0 ? (
            <Card className="py-12 text-center">
              <Loader size="lg" />
            </Card>
          ) : posts.list.length === 0 ? (
            <Card>
              <EmptyState
                icon={MessageSquare}
                title="No posts found"
                description="Try adjusting your filters"
              />
            </Card>
          ) : (
            posts.list.map((post) => (
              <Card
                key={post._id}
                className={`${
                  post.isHidden ? 'bg-red-50 border-red-200' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Author Info */}
                  <Avatar
                    src={post.userId?.profilePicture}
                    name={post.userId?.name || 'Unknown'}
                    size="md"
                  />

                  {/* Post Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900">
                          {post.userId?.name || 'Unknown User'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(post.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {post.isHidden && (
                          <Badge variant="danger">
                            <EyeOff className="w-3 h-3 mr-1 inline" />
                            Hidden
                          </Badge>
                        )}
                      </div>
                    </div>

                    <p className="text-gray-700 mb-3">{post.content}</p>

                    {post.mediaUrl && (
                      <div className="mb-3 rounded-lg overflow-hidden">
                        <img
                          src={post.mediaUrl}
                          alt="Post media"
                          className="max-h-64 w-full object-cover"
                        />
                      </div>
                    )}

                    {/* Engagement Stats */}
                    <div className="flex items-center gap-6 text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        {post.likes?.length || 0} likes
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        {post.comments?.length || 0} comments
                      </div>
                    </div>

                    {/* Moderation Info */}
                    {post.isHidden && post.moderationReason && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                        <p className="text-xs font-medium text-yellow-800 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Moderation Reason:
                        </p>
                        <p className="text-sm text-yellow-700 mt-1">
                          {post.moderationReason}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={post.isHidden ? 'outline' : 'danger'}
                        onClick={() => quickHide(post)}
                      >
                        {post.isHidden ? (
                          <>
                            <Eye className="w-4 h-4 mr-1" />
                            Unhide
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-4 h-4 mr-1" />
                            Quick Hide
                          </>
                        )}
                      </Button>
                      {!post.isHidden && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedPost(post);
                            setShowModerateModal(true);
                          }}
                        >
                          Hide with Reason
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {posts.totalPages > 1 && (
          <Card className="mt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Showing {posts.list.length} of {posts.total} posts
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={posts.currentPage === 1}
                  onClick={() =>
                    handleFilterChange('page', posts.currentPage - 1)
                  }
                >
                  Previous
                </Button>
                <span className="px-4 py-2 text-sm text-gray-700">
                  Page {posts.currentPage} of {posts.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={posts.currentPage === posts.totalPages}
                  onClick={() =>
                    handleFilterChange('page', posts.currentPage + 1)
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Moderate Modal */}
        {selectedPost && (
          <Modal
            isOpen={showModerateModal}
            onClose={() => {
              setShowModerateModal(false);
              setSelectedPost(null);
              setModerationReason('');
            }}
            title="Hide Post with Reason"
            footer={
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowModerateModal(false);
                    setSelectedPost(null);
                    setModerationReason('');
                  }}
                >
                  Cancel
                </Button>
                <Button variant="danger" onClick={() => handleModeratePost(true)}>
                  Hide Post
                </Button>
              </>
            }
          >
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-900 mb-2">
                  Post by {selectedPost.userId?.name}
                </p>
                <p className="text-sm text-gray-700">
                  {selectedPost.content?.substring(0, 200)}
                  {selectedPost.content?.length > 200 && '...'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Moderation Reason *
                </label>
                <textarea
                  value={moderationReason}
                  onChange={(e) => setModerationReason(e.target.value)}
                  placeholder="Explain why this post is being hidden (e.g., inappropriate content, spam, violation of community guidelines)..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <p className="text-xs text-gray-500">
                This post will be hidden from the community feed but not deleted
              </p>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default FeedModerationPage;
