# Use a minimal base image
FROM node:14-alpine

# Set the working directory
WORKDIR /usr/src/app

COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files to the working directory
COPY . .

# Expose the application port (if needed)
EXPOSE 3000

ENV GOOGLE_APPLICATION_CREDENTIALS=key2.json

# Define the command to run your application
CMD ["node","node_app.js"]
