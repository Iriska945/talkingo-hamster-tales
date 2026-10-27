FROM node:22-slim
WORKDIR /app

# Install build tools for native addons (better-sqlite3)
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*

# Copy dependencies first for fast caching
COPY package*.json ./
RUN npm ci

# Copy source code and build frontend
COPY . .
RUN npm run build

# Default environment variables
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# Start unified Node.js server (serves API on /api/* and frontend on /*)
CMD ["node", "server/index.js"]
