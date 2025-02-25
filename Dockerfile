# syntax=docker/dockerfile:1

### STAGE 1: Build ###
FROM node:18 AS builder

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json (if you use it)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your files
COPY . .

# Build your Vite project
RUN npm run build

### STAGE 2: Production ###
FROM nginx:bookworm

# Remove default nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy built files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
