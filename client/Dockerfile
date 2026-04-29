FROM node:alpine as builder

# Set the working directory to /app inside the container
WORKDIR /app

# Copy app files
COPY . .

# Install dependencies
RUN yarn install

# Build the app
# RUN yarn run build:development
RUN yarn run build:production

# Bundle static assets with nginx
FROM nginx:alpine as production

# Copy built assets from `builder` image
COPY --from=builder /app/build /usr/share/nginx/html

# Add your nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 8888

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
