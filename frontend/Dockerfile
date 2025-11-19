# syntax=docker/dockerfile:1
# --- Giai đoạn 1: Build (Thợ xây) ---
FROM node:22-alpine AS builder
WORKDIR /app

# Copy dependencies và cài đặt (Tận dụng cache)
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install

# Copy mã nguồn và chạy build
COPY frontend/. .
RUN npm run build

# --- Giai đoạn 2: Runner (Nhà ở - Chỉ lấy file cần chạy) ---
# Dùng node-slim để image cuối cùng nhỏ nhất
FROM node:22-slim AS runner
WORKDIR /app/frontend

# Copy các thành phần cần thiết cho chế độ standalone
COPY --from=builder /app/frontend/.next/standalone ./
COPY --from=builder /app/frontend/.next/static ./.next/static
COPY --from=builder /app/frontend/public ./public
# Đảm bảo NODE_ENV là production
ENV NODE_ENV production
# Host mặc định của Next.js Standalone
ENV HOST 0.0.0.0

# User không phải root để bảo mật
USER node

EXPOSE 3000
# Lệnh chạy standalone. Next.js tự tạo server.js trong standalone folder
CMD ["node", "server.js"]