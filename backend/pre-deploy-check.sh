#!/bin/bash

# EmmiDev CodeBridge - Pre-Deployment Checklist Script
# Run this before deploying to Render

echo "🚀 EmmiDev CodeBridge - Pre-Deployment Checklist"
echo "=================================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track issues
ISSUES=0

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Run this script from the backend directory${NC}"
    exit 1
fi

echo "📋 Checking prerequisites..."
echo ""

# 1. Check Node.js version
echo -n "1. Node.js version (>=18.x): "
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 18 ]; then
    echo -e "${GREEN}✓ $(node -v)${NC}"
else
    echo -e "${RED}✗ $(node -v) - Please upgrade to Node 18+${NC}"
    ISSUES=$((ISSUES + 1))
fi

# 2. Check npm version
echo -n "2. npm version (>=9.x): "
NPM_VERSION=$(npm -v | cut -d'.' -f1)
if [ "$NPM_VERSION" -ge 9 ]; then
    echo -e "${GREEN}✓ $(npm -v)${NC}"
else
    echo -e "${RED}✗ $(npm -v) - Please upgrade npm${NC}"
    ISSUES=$((ISSUES + 1))
fi

# 3. Check if .env exists (shouldn't be committed)
echo -n "3. .env file security: "
if git ls-files --error-unmatch .env 2>/dev/null; then
    echo -e "${RED}✗ .env is tracked by Git! Run: git rm --cached .env${NC}"
    ISSUES=$((ISSUES + 1))
else
    echo -e "${GREEN}✓ .env not committed${NC}"
fi

# 4. Check package.json has required fields
echo -n "4. package.json engines field: "
if grep -q '"engines"' package.json; then
    echo -e "${GREEN}✓ Present${NC}"
else
    echo -e "${YELLOW}⚠ Missing - Add Node/npm version requirements${NC}"
fi

# 5. Check dependencies install
echo -n "5. Dependencies install test: "
if npm install --silent > /dev/null 2>&1; then
    echo -e "${GREEN}✓ All dependencies installed${NC}"
else
    echo -e "${RED}✗ npm install failed${NC}"
    ISSUES=$((ISSUES + 1))
fi

# 6. Check if server starts (quick test)
echo -n "6. Server startup test: "
timeout 5s npm start > /dev/null 2>&1
if [ $? -eq 124 ]; then
    echo -e "${GREEN}✓ Server starts successfully${NC}"
else
    echo -e "${RED}✗ Server failed to start${NC}"
    ISSUES=$((ISSUES + 1))
fi

# 7. Check render.yaml exists
echo -n "7. render.yaml configuration: "
if [ -f "render.yaml" ]; then
    echo -e "${GREEN}✓ Present${NC}"
else
    echo -e "${YELLOW}⚠ Missing - Create render.yaml for easier deployment${NC}"
fi

# 8. Check critical files
echo -n "8. Required files present: "
REQUIRED_FILES=("server.js" "package.json" "config/db.js" "config/passport.js")
MISSING_FILES=()

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -eq 0 ]; then
    echo -e "${GREEN}✓ All required files present${NC}"
else
    echo -e "${RED}✗ Missing: ${MISSING_FILES[*]}${NC}"
    ISSUES=$((ISSUES + 1))
fi

# 9. Check .gitignore
echo -n "9. .gitignore configuration: "
if [ -f ".gitignore" ] && grep -q "node_modules" .gitignore && grep -q ".env" .gitignore; then
    echo -e "${GREEN}✓ Properly configured${NC}"
else
    echo -e "${YELLOW}⚠ Check .gitignore includes node_modules and .env${NC}"
fi

# 10. Check Git status
echo -n "10. Git repository status: "
if git rev-parse --git-dir > /dev/null 2>&1; then
    UNCOMMITTED=$(git status --porcelain | wc -l)
    if [ "$UNCOMMITTED" -eq 0 ]; then
        echo -e "${GREEN}✓ All changes committed${NC}"
    else
        echo -e "${YELLOW}⚠ $UNCOMMITTED uncommitted changes${NC}"
    fi
else
    echo -e "${RED}✗ Not a Git repository${NC}"
    ISSUES=$((ISSUES + 1))
fi

echo ""
echo "=================================================="

# Summary
if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Ready for deployment.${NC}"
    echo ""
    echo "📝 Next Steps:"
    echo "   1. Push code to GitHub: git push origin main"
    echo "   2. Go to https://dashboard.render.com"
    echo "   3. Create new Web Service"
    echo "   4. Connect your GitHub repository"
    echo "   5. Set root directory to: backend"
    echo "   6. Configure environment variables"
    echo "   7. Deploy!"
    echo ""
    echo "📖 See RENDER_DEPLOYMENT_GUIDE.md for detailed instructions"
else
    echo -e "${RED}❌ Found $ISSUES issue(s). Please fix before deploying.${NC}"
    exit 1
fi
