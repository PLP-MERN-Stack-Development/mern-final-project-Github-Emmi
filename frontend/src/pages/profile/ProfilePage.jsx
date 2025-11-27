import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Camera,
  Lock,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Shield,
  Bell,
  Globe,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Card, Button, Input, Textarea, Avatar, Badge, Loader, useToast } from '../../components/ui';
import api from '../../services/api';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    bio: '',
    phone: '',
    location: '',
    website: '',
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Settings state
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    courseUpdates: true,
    assignmentReminders: true,
    communityPosts: false,
    profileVisibility: 'public',
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        phone: user.phone || '',
        location: user.location || '',
        website: user.website || '',
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      addToast('Please select an image file', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      addToast('Image size should be less than 5MB', 'error');
      return;
    }

    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const { data } = await api.post('/auth/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      addToast('Avatar updated successfully!', 'success');
      
      // Update user in Redux store
      window.location.reload(); // Temporary - should update Redux state instead
    } catch (error) {
      console.error('Avatar upload error:', error);
      addToast(error.response?.data?.message || 'Failed to upload avatar', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.put('/auth/profile', profileData);
      addToast('Profile updated successfully!', 'success');
      
      // Update user in Redux store
      window.location.reload(); // Temporary - should update Redux state instead
    } catch (error) {
      console.error('Profile update error:', error);
      addToast(error.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      addToast('Please fill in all password fields', 'error');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      addToast('New passwords do not match', 'error');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      addToast('New password must be at least 6 characters', 'error');
      return;
    }

    setLoading(true);

    try {
      await api.put('/auth/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      addToast('Password changed successfully!', 'success');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Password change error:', error);
      addToast(error.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put('/auth/settings', settings);
      addToast('Settings updated successfully!', 'success');
    } catch (error) {
      console.error('Settings update error:', error);
      addToast(error.response?.data?.message || 'Failed to update settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'password', name: 'Password', icon: Lock },
    { id: 'settings', name: 'Settings', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="mt-2 text-gray-600">Manage your profile and account preferences</p>
        </div>

        {/* Profile Header Card */}
        <Card className="mb-6">
          <div className="flex flex-col md:flex-row items-center gap-6 p-6">
            {/* Avatar */}
            <div className="relative group">
              <Avatar
                src={user?.avatarUrl || user?.profilePicture}
                name={user?.name}
                size="xl"
                className="ring-4 ring-white shadow-lg"
              />
              <label
                htmlFor="avatar-upload"
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                {uploadingAvatar ? (
                  <Loader size="sm" />
                ) : (
                  <Camera className="w-8 h-8 text-white" />
                )}
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={uploadingAvatar}
              />
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
              <p className="text-gray-600">{user?.email}</p>
              <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                <Badge variant={user?.role === 'admin' || user?.role === 'superadmin' ? 'error' : 'primary'}>
                  {user?.role?.toUpperCase()}
                </Badge>
                {user?.verifiedTutor && (
                  <Badge variant="success" icon={CheckCircle}>
                    Verified Tutor
                  </Badge>
                )}
                {user?.emailVerified && (
                  <Badge variant="info" icon={CheckCircle}>
                    Email Verified
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-center md:justify-start gap-4 mt-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined {new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${
                      activeTab === tab.id
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h3>
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <Input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      placeholder="John Doe"
                      required
                      icon={User}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      placeholder="john@example.com"
                      required
                      icon={Mail}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      placeholder="+1 (555) 000-0000"
                      icon={Phone}
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <Input
                      type="text"
                      name="location"
                      value={profileData.location}
                      onChange={handleProfileChange}
                      placeholder="Lagos, Nigeria"
                      icon={MapPin}
                    />
                  </div>

                  {/* Website */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website / Portfolio
                    </label>
                    <Input
                      type="url"
                      name="website"
                      value={profileData.website}
                      onChange={handleProfileChange}
                      placeholder="https://yourwebsite.com"
                      icon={Globe}
                    />
                  </div>

                  {/* Bio */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio / About
                    </label>
                    <Textarea
                      name="bio"
                      value={profileData.bio}
                      onChange={handleProfileChange}
                      placeholder="Tell us about yourself..."
                      rows={4}
                      maxLength={500}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {profileData.bio.length}/500 characters
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button type="submit" loading={loading} icon={Save}>
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        )}

        {activeTab === 'password' && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Change Password</h3>
              <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-xl">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password *
                  </label>
                  <div className="relative">
                    <Input
                      type={showPasswords.current ? 'text' : 'password'}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter current password"
                      required
                      icon={Lock}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords((prev) => ({ ...prev, current: !prev.current }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password *
                  </label>
                  <div className="relative">
                    <Input
                      type={showPasswords.new ? 'text' : 'password'}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter new password"
                      required
                      icon={Lock}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Password must be at least 6 characters long
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <Input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirm new password"
                      required
                      icon={Lock}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {passwordData.newPassword && passwordData.confirmPassword && (
                    <p className={`mt-1 text-xs ${
                      passwordData.newPassword === passwordData.confirmPassword
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {passwordData.newPassword === passwordData.confirmPassword ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Passwords match
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Passwords do not match
                        </span>
                      )}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    })}
                    icon={X}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" loading={loading} icon={Save}>
                    Update Password
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        )}

        {activeTab === 'settings' && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Settings</h3>
              <form onSubmit={handleSettingsSubmit} className="space-y-6">
                {/* Email Notifications */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-indigo-600" />
                    Email Notifications
                  </h4>
                  <div className="space-y-3 pl-7">
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Enable email notifications</span>
                      <input
                        type="checkbox"
                        checked={settings.emailNotifications}
                        onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Course updates and announcements</span>
                      <input
                        type="checkbox"
                        checked={settings.courseUpdates}
                        onChange={(e) => handleSettingChange('courseUpdates', e.target.checked)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        disabled={!settings.emailNotifications}
                      />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Assignment reminders</span>
                      <input
                        type="checkbox"
                        checked={settings.assignmentReminders}
                        onChange={(e) => handleSettingChange('assignmentReminders', e.target.checked)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        disabled={!settings.emailNotifications}
                      />
                    </label>
                  </div>
                </div>

                {/* Push Notifications */}
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-indigo-600" />
                    Push Notifications
                  </h4>
                  <div className="space-y-3 pl-7">
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Enable push notifications</span>
                      <input
                        type="checkbox"
                        checked={settings.pushNotifications}
                        onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Community posts and interactions</span>
                      <input
                        type="checkbox"
                        checked={settings.communityPosts}
                        onChange={(e) => handleSettingChange('communityPosts', e.target.checked)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        disabled={!settings.pushNotifications}
                      />
                    </label>
                  </div>
                </div>

                {/* Privacy Settings */}
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-indigo-600" />
                    Privacy
                  </h4>
                  <div className="space-y-3 pl-7">
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Profile visibility</span>
                      <select
                        value={settings.profileVisibility}
                        onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="public">Public</option>
                        <option value="enrolled">Enrolled Students Only</option>
                        <option value="private">Private</option>
                      </select>
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button type="submit" loading={loading} icon={Save}>
                    Save Settings
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        )}

        {/* Account Stats (optional enhancement) */}
        {user?.role === 'student' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <Card>
              <div className="p-6 text-center">
                <div className="text-3xl font-bold text-indigo-600">{user?.enrolledCourses?.length || 0}</div>
                <div className="text-sm text-gray-600 mt-1">Enrolled Courses</div>
              </div>
            </Card>
            <Card>
              <div className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600">0</div>
                <div className="text-sm text-gray-600 mt-1">Completed Assignments</div>
              </div>
            </Card>
            <Card>
              <div className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-600">0</div>
                <div className="text-sm text-gray-600 mt-1">Community Posts</div>
              </div>
            </Card>
          </div>
        )}

        {user?.role === 'tutor' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <Card>
              <div className="p-6 text-center">
                <div className="text-3xl font-bold text-indigo-600">0</div>
                <div className="text-sm text-gray-600 mt-1">Courses Created</div>
              </div>
            </Card>
            <Card>
              <div className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600">0</div>
                <div className="text-sm text-gray-600 mt-1">Total Students</div>
              </div>
            </Card>
            <Card>
              <div className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {user?.verifiedTutor ? '✓' : '✗'}
                </div>
                <div className="text-sm text-gray-600 mt-1">Verification Status</div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
