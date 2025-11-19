#!/bin/bash

# Stop the application using Docker Compose
docker compose down

# Start the application using Docker Compose in detached mode with build
docker compose up -d --build