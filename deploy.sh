#!/bin/bash

# Build the project
echo "Building the project..."
npm run build

# Create or switch to gh-pages branch
echo "Creating gh-pages branch..."
git checkout -b gh-pages

# Remove everything except the dist folder and .git
echo "Cleaning up..."
find . -maxdepth 1 ! -name 'dist' ! -name '.git' ! -name '.gitignore' -exec rm -rf {} \;

# Move contents of dist to root
echo "Moving build files to root..."
mv dist/* .
rm -rf dist

# Add all files
echo "Adding files to git..."
git add .

# Commit changes
echo "Committing changes..."
git commit -m "Deploy to GitHub Pages"

# Push to gh-pages branch
echo "Pushing to gh-pages branch..."
git push -f origin gh-pages

# Switch back to main branch
echo "Switching back to main branch..."
git checkout main

echo "Deployment complete!"
