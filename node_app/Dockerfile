# Use a minimal base image
FROM node:14-alpine AS builder

# Set the working directory
WORKDIR /node_app

# Copy only the package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the application code
COPY . .

# Build the application (if needed)
# RUN npm run build

# Use a smaller base image for the final image
FROM node:14-alpine

# Set the working directory
WORKDIR /node_app

# Copy only the necessary files from the builder stage
COPY --from=builder /node_app .

# Expose the application port (if needed)
EXPOSE 3000

# Define the command to run your application
CMD ["npm", "start"]
