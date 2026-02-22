#!/bin/bash cd "c:\Users\mohamed khaled\Desktop\test\GraduationProject-main\GraduationProject-main"

echo "========================================" 
echo "Pushing to GitHub..." 
echo "========================================"

git status
git add .
git commit -m "Update: Database connection for Docker, API endpoints, and IP configuration (98.89.224.40)" --allow-empty
git push origin main

echo "========================================" 
echo "Push completed!" 
echo "========================================" 
