# syntax=docker/dockerfile:1
FROM node:22-alpine 
WORKDIR /app

# Copy dependencies
COPY backend/package.json backend/package-lock.json ./
RUN npm install

# Copy toàn bộ mã nguồn
COPY backend/. .

# User không phải root
USER node

EXPOSE 4000
CMD ["npm", "run", "start"]