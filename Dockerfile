# Use the official Node.js image as the base image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

RUN npm config set registry https://registry.npmjs.org/

RUN npm install -g npm@latest

RUN npm cache clean --force

# Install the application dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the NestJS application
RUN npm run build

# Command to run the application
CMD ["node", "dist/main.js"]

# Expose the application port
EXPOSE 3003
