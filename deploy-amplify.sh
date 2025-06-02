#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting Amplify deployment..."

# Check if GitHub token is provided
if [ -z "$1" ]; then
    echo "❌ Please provide GitHub token"
    echo "Usage: ./deploy-amplify.sh <github-token> [repository-url]"
    exit 1
fi

GITHUB_TOKEN=$1
STACK_NAME="NIP-TEST-todo-amplify"
REPO_URL=${2:-"https://github.com/nakarimi/amplify-fullstack-lambda-yt"}

# Check if stack exists and get Amplify App ID if it does
echo "🔍 Checking for existing stack..."
if aws cloudformation describe-stacks --stack-name $STACK_NAME &>/dev/null; then
    echo "📦 Found existing stack, getting Amplify App ID..."
    EXISTING_APP_ID=$(aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --query 'Stacks[0].Outputs[?OutputKey==`AmplifyAppId`].OutputValue' \
        --output text)
    
    if [ -z "$EXISTING_APP_ID" ]; then
        echo "⚠️ Stack exists but no Amplify App ID found, will create new app"
        EXISTING_APP_ID=""
    else
        echo "✅ Found existing Amplify App ID: $EXISTING_APP_ID"
    fi
else
    echo "📦 No existing stack found, will create new app"
    EXISTING_APP_ID=""
fi

# Check if stack is in a failed state
if aws cloudformation describe-stacks --stack-name $STACK_NAME &>/dev/null; then
    STACK_STATUS=$(aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --query 'Stacks[0].StackStatus' \
        --output text)
    
    if [[ "$STACK_STATUS" == *"FAILED"* ]] || [[ "$STACK_STATUS" == *"ROLLBACK"* ]]; then
        echo "⚠️ Stack is in a failed state ($STACK_STATUS). Attempting to continue update..."
    fi
fi

echo "📦 Deploying CloudFormation stack..."
aws cloudformation deploy \
    --template-file amplify-app.yml \
    --stack-name $STACK_NAME \
    --parameter-overrides \
        GitHubToken=$GITHUB_TOKEN \
        ExistingAppId=$EXISTING_APP_ID \
        RepositoryUrl=$REPO_URL \
    --capabilities CAPABILITY_IAM \
    --no-fail-on-empty-changeset

echo "⏳ Waiting for stack deployment to complete..."
if aws cloudformation describe-stacks --stack-name $STACK_NAME &>/dev/null; then
    aws cloudformation wait stack-update-complete --stack-name $STACK_NAME || true
else
    aws cloudformation wait stack-create-complete --stack-name $STACK_NAME || true
fi

# Get stack outputs
echo "📊 Stack outputs:"
aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Outputs' \
    --output table

echo "✅ Deployment completed!" 