# Stage 1: Prepare static assets (no Node needed — just file copy)
FROM alpine:3.20 AS build
WORKDIR /app
COPY . .
RUN mkdir -p dist \
    && cp index.html dist/ \
    && cp -r css dist/ \
    && cp -r js dist/

# Stage 2: Serve via Nginx stable
FROM nginx:1.26-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
