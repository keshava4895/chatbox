# Stage 1: build React app
FROM node:18-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: serve with nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf.template
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN sed -i 's/\r//' /docker-entrypoint.sh && chmod +x /docker-entrypoint.sh
ENV BACKEND_HOST=nikechatbox-backend.internal.yellowdune-0d460475.westus2.azurecontainerapps.io
EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]
