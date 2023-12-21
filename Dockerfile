# Use a minimal base image
FROM node:14-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy only the package.json and package-lock.json files
COPY . /app

# Install dependencies
RUN npm install

# Expose the application port (if needed)
EXPOSE 3000

# Define the command to run your application
CMD ["node","node_app.js"]
