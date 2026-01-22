FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install dependencies first (for better caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript
RUN npm install typescript --save-dev && npm run build

# Copy assets (banner images, etc.)
COPY src/assets ./dist/assets

# Create directories for persistent data
RUN mkdir -p /app/data /app/cache /app/user_data

# Set environment
ENV NODE_ENV=production

# Start the bot
CMD ["node", "dist/index.js"]
