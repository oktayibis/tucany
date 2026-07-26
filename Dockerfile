# Multi-stage build for Toskana 2026 PWA
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json ./

# Install dependencies strictly
RUN npm ci

# Copy full application code
COPY . .

# Run data validation, typecheck, and Vite PWA production build
RUN npm run build

# Production stage using Nginx Alpine
FROM nginx:alpine

# Copy custom Nginx configuration with PWA headers and SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
