#!/bin/bash

# B2B Local Development Setup Script
# This script helps set up the local B2B buyer portal for development

echo "🚀 Setting up B2B Local Development Environment"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if LOCAL_BUYER_PORTAL_HOST is set
if [ -z "$LOCAL_BUYER_PORTAL_HOST" ]; then
    echo "⚠️  LOCAL_BUYER_PORTAL_HOST is not set. Setting to default: http://localhost:3001"
    export LOCAL_BUYER_PORTAL_HOST=http://localhost:3001
fi

echo "📋 Current B2B Configuration:"
echo "   LOCAL_BUYER_PORTAL_HOST: $LOCAL_BUYER_PORTAL_HOST"

# Check if B2B buyer portal directory exists
B2B_DIR="../b2b-buyer-portal"
if [ ! -d "$B2B_DIR" ]; then
    echo "📦 B2B buyer portal not found. Cloning from GitHub..."
    cd ..
    git clone https://github.com/bigcommerce/b2b-buyer-portal.git
    cd b2b-buyer-portal
    
    echo "📦 Installing dependencies..."
    npm install
    
    echo "✅ B2B buyer portal cloned and dependencies installed"
    cd ../occ-cursor
else
    echo "✅ B2B buyer portal directory found at $B2B_DIR"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Start the B2B buyer portal:"
echo "   cd $B2B_DIR && npm run dev"
echo ""
echo "2. In another terminal, start your Catalyst application:"
echo "   npm run dev"
echo ""
echo "3. Make sure your .env.local includes:"
echo "   LOCAL_BUYER_PORTAL_HOST=$LOCAL_BUYER_PORTAL_HOST"
echo ""
echo "4. Configure your BigCommerce control panel:"
echo "   - Go to Settings > B2B > Buyer Portal"
echo "   - Set Buyer Portal type to 'Custom'"
echo "   - Set Custom URL to: $LOCAL_BUYER_PORTAL_HOST"
echo ""
echo "5. Test the integration:"
echo "   - Log in to your B2B account"
echo "   - Navigate to the buyer portal"
echo "   - Test the quick order functionality at: $LOCAL_BUYER_PORTAL_HOST/#/purchased-products"
echo ""
echo "🔧 For debugging, visit: http://localhost:3000/b2b-debug" 