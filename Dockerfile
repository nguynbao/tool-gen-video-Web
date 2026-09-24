# Stage 1: Build React App
FROM node:20-alpine AS build-stage

WORKDIR /app

# Copy package files va cai dat dependencies
COPY package*.json ./
RUN npm ci

# Copy toan bo source code Frontend
COPY . .

# Build ung dung React Vite voi VITE_API_BASE_URL mac dinh la rong (su dung relative path /api)
ENV VITE_API_BASE_URL=""
RUN npm run build

# Stage 2: Serve voi Nginx
FROM nginx:alpine

# Copy file cau hinh Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts tu Stage 1
COPY --from=build-stage /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
