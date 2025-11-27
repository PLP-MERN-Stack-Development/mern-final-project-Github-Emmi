#!/bin/bash

# OAuth Authentication Setup Script
# Run this script to install required dependencies for GitHub and LinkedIn OAuth

echo "🚀 Installing OAuth dependencies for EmmiDev CodeBridge..."
echo ""

# Navigate to backend directory
cd backend

echo "📦 Installing backend OAuth packages..."
npm install passport@^0.7.0 passport-github2@^0.1.12 passport-linkedin-oauth2@^2.0.0 express-session@^1.18.1

if [ $? -eq 0 ]; then
    echo "✅ Backend OAuth dependencies installed successfully!"
else
    echo "❌ Error installing backend dependencies"
    exit 1
fi

echo ""
echo "✨ OAuth setup complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Register OAuth apps on GitHub and LinkedIn"
echo "  2. Add credentials to backend/.env file"
echo "  3. See OAUTH_SETUP.md for detailed instructions"
echo ""
echo "🎯 OAuth endpoints ready:"
echo "  - GitHub Login: http://localhost:5000/api/auth/github"
echo "  - LinkedIn Login: http://localhost:5000/api/auth/linkedin"
echo ""
