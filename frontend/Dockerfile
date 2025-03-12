# Use a Node.js image
FROM node:22

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (npm install)
RUN npm install

# Expose the port Vite will run on
EXPOSE 5173

# Run the Vite development server
CMD ["npm", "run", "dev"]