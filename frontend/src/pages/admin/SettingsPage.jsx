import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Settings as SettingsIcon,
  Save,
  Key,
  Globe,
  Shield,
  Database,
  AlertCircle,
} from 'lucide-react';
import {
  fetchSettings,
  updateSettings,
} from '../../redux/slices/adminSlice';
import { Card, Button, Input, Loader, Badge, useToast } from '../../components/ui';

const SettingsPage = () => {
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const { settings } = useSelector((state) => state.admin);

  const [formData, setFormData] = useState({
    siteName: '',
    siteDescription: '',
    supportEmail: '',
    maintenanceMode: false,
    allowRegistration: true,
    cloudinaryCloudName: '',
    cloudinaryApiKey: '',
    cloudinaryApiSecret: '',
    zoomApiKey: '',
    zoomApiSecret: '',
    openaiApiKey: '',
    stripePublicKey: '',
    stripeSecretKey: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  useEffect(() => {
    if (settings.data) {
      setFormData({
        siteName: settings.data.siteName || '',
        siteDescription: settings.data.siteDescription || '',
        supportEmail: settings.data.supportEmail || '',
        maintenanceMode: settings.data.maintenanceMode || false,
        allowRegistration: settings.data.allowRegistration !== false,
        cloudinaryCloudName: settings.data.cloudinaryCloudName || '',
        cloudinaryApiKey: settings.data.cloudinaryApiKey || '',
        cloudinaryApiSecret: settings.data.cloudinaryApiSecret || '',
        zoomApiKey: settings.data.zoomApiKey || '',
        zoomApiSecret: settings.data.zoomApiSecret || '',
        openaiApiKey: settings.data.openaiApiKey || '',
        stripePublicKey: settings.data.stripePublicKey || '',
        stripeSecretKey: settings.data.stripeSecretKey || '',
      });
    }
  }, [settings.data]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (section) => {
    setLoading(true);
    try {
      const updateData =
        section === 'general'
          ? {
              siteName: formData.siteName,
              siteDescription: formData.siteDescription,
              supportEmail: formData.supportEmail,
              maintenanceMode: formData.maintenanceMode,
              allowRegistration: formData.allowRegistration,
            }
          : section === 'cloudinary'
          ? {
              cloudinaryCloudName: formData.cloudinaryCloudName,
              cloudinaryApiKey: formData.cloudinaryApiKey,
              cloudinaryApiSecret: formData.cloudinaryApiSecret,
            }
          : section === 'zoom'
          ? {
              zoomApiKey: formData.zoomApiKey,
              zoomApiSecret: formData.zoomApiSecret,
            }
          : section === 'openai'
          ? {
              openaiApiKey: formData.openaiApiKey,
            }
          : {
              stripePublicKey: formData.stripePublicKey,
              stripeSecretKey: formData.stripeSecretKey,
            };

      await dispatch(updateSettings(updateData)).unwrap();
      addToast('Settings updated successfully!', 'success');
    } catch (error) {
      addToast(error || 'Failed to update settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (settings.loading && !settings.data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <SettingsIcon className="w-8 h-8" />
              System Settings
            </h1>
            <p className="text-gray-600 mt-1">
              Configure platform settings and API integrations
            </p>
          </div>
          {formData.maintenanceMode && (
            <Badge variant="danger">
              <AlertCircle className="w-3 h-3 mr-1 inline" />
              Maintenance Mode Active
            </Badge>
          )}
        </div>

        {/* General Settings */}
        <Card className="mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              General Settings
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Name
              </label>
              <Input
                type="text"
                value={formData.siteName}
                onChange={(e) => handleChange('siteName', e.target.value)}
                placeholder="EmmiDev CodeBridge"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Description
              </label>
              <textarea
                value={formData.siteDescription}
                onChange={(e) => handleChange('siteDescription', e.target.value)}
                placeholder="Learn, connect, and grow with expert tutors"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Support Email
              </label>
              <Input
                type="email"
                value={formData.supportEmail}
                onChange={(e) => handleChange('supportEmail', e.target.value)}
                placeholder="support@emmidev.com"
              />
            </div>

            <div className="flex items-center justify-between py-3 border-t">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Maintenance Mode
                </p>
                <p className="text-xs text-gray-500">
                  Disable site access for all users except admins
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.maintenanceMode}
                  onChange={(e) =>
                    handleChange('maintenanceMode', e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3 border-t">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Allow Registration
                </p>
                <p className="text-xs text-gray-500">
                  Enable new user sign-ups
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allowRegistration}
                  onChange={(e) =>
                    handleChange('allowRegistration', e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              onClick={() => handleSave('general')}
              disabled={loading}
            >
              <Save className="w-4 h-4 mr-2" />
              Save General Settings
            </Button>
          </div>
        </Card>

        {/* Cloudinary Settings */}
        <Card className="mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Cloudinary Configuration
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cloud Name
              </label>
              <Input
                type="text"
                value={formData.cloudinaryCloudName}
                onChange={(e) =>
                  handleChange('cloudinaryCloudName', e.target.value)
                }
                placeholder="your-cloud-name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <Input
                type="text"
                value={formData.cloudinaryApiKey}
                onChange={(e) => handleChange('cloudinaryApiKey', e.target.value)}
                placeholder="123456789012345"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Secret
              </label>
              <Input
                type="password"
                value={formData.cloudinaryApiSecret}
                onChange={(e) =>
                  handleChange('cloudinaryApiSecret', e.target.value)
                }
                placeholder="••••••••••••••••••••"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              onClick={() => handleSave('cloudinary')}
              disabled={loading}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Cloudinary Settings
            </Button>
          </div>
        </Card>

        {/* Zoom Settings */}
        <Card className="mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Key className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Zoom API Configuration
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zoom API Key
              </label>
              <Input
                type="text"
                value={formData.zoomApiKey}
                onChange={(e) => handleChange('zoomApiKey', e.target.value)}
                placeholder="your-zoom-api-key"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zoom API Secret
              </label>
              <Input
                type="password"
                value={formData.zoomApiSecret}
                onChange={(e) => handleChange('zoomApiSecret', e.target.value)}
                placeholder="••••••••••••••••••••"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={() => handleSave('zoom')} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              Save Zoom Settings
            </Button>
          </div>
        </Card>

        {/* OpenAI Settings */}
        <Card className="mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              OpenAI Configuration
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OpenAI API Key
              </label>
              <Input
                type="password"
                value={formData.openaiApiKey}
                onChange={(e) => handleChange('openaiApiKey', e.target.value)}
                placeholder="sk-••••••••••••••••••••"
              />
              <p className="text-xs text-gray-500 mt-1">
                Used for AI Assistant and code help features
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={() => handleSave('openai')} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              Save OpenAI Settings
            </Button>
          </div>
        </Card>

        {/* Stripe Settings */}
        <Card className="mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Key className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Stripe Payment Configuration
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stripe Public Key
              </label>
              <Input
                type="text"
                value={formData.stripePublicKey}
                onChange={(e) =>
                  handleChange('stripePublicKey', e.target.value)
                }
                placeholder="pk_test_••••••••••••••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stripe Secret Key
              </label>
              <Input
                type="password"
                value={formData.stripeSecretKey}
                onChange={(e) =>
                  handleChange('stripeSecretKey', e.target.value)
                }
                placeholder="sk_test_••••••••••••••••••••"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={() => handleSave('stripe')} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              Save Stripe Settings
            </Button>
          </div>
        </Card>

        {/* Info Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Security Notice
              </p>
              <p className="text-sm text-blue-800 mt-1">
                API keys and secrets are encrypted and stored securely. Never
                share these credentials publicly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
