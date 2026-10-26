# Stage 1: Build (copy static assets into dist/)
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install --ignore-scripts || true
COPY . .
RUN npm run build

# Stage 2: Serve production via Nginx
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
