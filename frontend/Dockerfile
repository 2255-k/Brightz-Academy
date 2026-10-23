# ==============================================================================
# Multi-Stage Production Dockerfile for Bright Mindz Academy React SPA
# ==============================================================================

# Stage 1: Build the Vite production bundle
FROM node:20-alpine AS build

WORKDIR /app

# Cache dependencies
COPY package*.json ./
RUN npm ci || npm install

# Copy source code and build
COPY . ./
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# Stage 2: Serve via high-performance Nginx Alpine
FROM nginx:alpine

# Copy compiled static files
COPY --from=build /app/dist /usr/share/nginx/html

# Copy SPA routing Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
