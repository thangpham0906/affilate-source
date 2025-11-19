#!/bin/bash

# Stop the application using Docker Compose
docker compose down

# Start the application using Docker Compose in detached mode with build
docker compose up -d --build

# Optional: View logs for the backend service
# docker logs affiliate-backend-api --tail 50