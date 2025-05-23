#!/bin/sh

# Stop and remove existing containers, networks, and volumes
echo "Stopping existing application (if running)..."
docker-compose down

# Build all services defined in docker-compose.yml
echo "Building Docker images..."
docker-compose build

# Start all services in detached mode
echo "Starting application..."
docker-compose up -d

echo "Application started successfully!"
echo "Frontend should be available at http://localhost:3000"
echo "Backend API should be available at http://localhost:5001"
