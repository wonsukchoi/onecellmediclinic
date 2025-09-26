#!/bin/bash

# OneCell Medical Clinic - Supabase Edge Functions Deployment Script
# This script helps deploy all Edge Functions to Supabase

set -e  # Exit on any error

echo "🏥 OneCell Medical Clinic - Edge Functions Deployment"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    print_error "Supabase CLI is not installed. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

print_success "Supabase CLI found"

# Check if we're in the right directory
if [ ! -f "supabase/config.toml" ]; then
    print_error "supabase/config.toml not found. Please run this script from the project root."
    exit 1
fi

# Check if user is logged in
if ! supabase status &> /dev/null; then
    print_warning "Not logged in to Supabase. Attempting to log in..."
    supabase login
fi

# List of Edge Functions to deploy
FUNCTIONS=("book-appointment" "consultation-request" "get-availability" "manage-gallery")

print_status "Starting deployment of Edge Functions..."

# Deploy each function
for func in "${FUNCTIONS[@]}"; do
    print_status "Deploying function: $func"

    if supabase functions deploy "$func"; then
        print_success "Successfully deployed $func"
    else
        print_error "Failed to deploy $func"
        exit 1
    fi
done

print_success "All Edge Functions deployed successfully!"

# Check function status
echo ""
print_status "Checking function status..."
supabase functions list

# Set up environment variables (if .env file exists)
if [ -f ".env" ]; then
    print_status "Setting up environment variables..."

    # Read environment variables from .env file
    if grep -q "SUPABASE_URL=" .env; then
        SUPABASE_URL=$(grep "SUPABASE_URL=" .env | cut -d '=' -f2 | tr -d '"')
        supabase secrets set SUPABASE_URL="$SUPABASE_URL" --project-ref $(supabase status | grep "Project ref" | awk '{print $3}')
    fi

    if grep -q "SUPABASE_ANON_KEY=" .env; then
        SUPABASE_ANON_KEY=$(grep "SUPABASE_ANON_KEY=" .env | cut -d '=' -f2 | tr -d '"')
        supabase secrets set SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY" --project-ref $(supabase status | grep "Project ref" | awk '{print $3}')
    fi

    if grep -q "SUPABASE_SERVICE_ROLE_KEY=" .env; then
        SUPABASE_SERVICE_ROLE_KEY=$(grep "SUPABASE_SERVICE_ROLE_KEY=" .env | cut -d '=' -f2 | tr -d '"')
        supabase secrets set SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY" --project-ref $(supabase status | grep "Project ref" | awk '{print $3}')
    fi

    print_success "Environment variables configured"
else
    print_warning ".env file not found. Environment variables not configured."
    print_warning "Please set up your environment variables manually:"
    echo "supabase secrets set SUPABASE_URL=https://your-project.supabase.co"
    echo "supabase secrets set SUPABASE_ANON_KEY=your-anon-key"
    echo "supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key"
fi

echo ""
print_success "🎉 Deployment complete!"
echo ""
print_status "Your Edge Functions are now available at:"
PROJECT_REF=$(supabase status | grep "Project ref" | awk '{print $3}' || echo "YOUR-PROJECT-REF")

for func in "${FUNCTIONS[@]}"; do
    echo "  • https://$PROJECT_REF.supabase.co/functions/v1/$func"
done

echo ""
print_status "Next steps:"
echo "1. Update your frontend application to use the new Edge Functions"
echo "2. Test the functions with your application"
echo "3. Monitor function logs: supabase functions logs <function-name>"
echo ""
print_status "For more information, see the README in supabase/functions/"