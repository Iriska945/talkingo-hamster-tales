FROM node:22-slim
WORKDIR /app

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
