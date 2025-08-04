# Stage 1: Build
FROM node:18 AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Stage 2: Production
FROM node:18 AS production

# Set working directory
WORKDIR /app

# Copy only the necessary files from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./

# Install only production dependencies
RUN npm install --production

# Expose the port the app runs on
EXPOSE 3112

# Start the Next.js application
CMD ["npm", "start"]
