# Stage 1: Build stage
FROM node:14 AS build

WORKDIR /node-gcp/node-app/

# Copy package.json and package-lock.json separately
# This allows for better Docker caching of dependencies
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production stage
FROM node:14-alpine

WORKDIR /node-gcp/node-app/

# Copy only necessary files from the build stage
COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./dist

# Install only production dependencies
RUN npm ci --only=production

# Expose the port your app runs on
EXPOSE 3000

# Define the startup command
CMD [ "npm", "start" ]
