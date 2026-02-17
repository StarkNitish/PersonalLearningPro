# ── PersonalLearningPro Development Dockerfile ──
# Full-stack Vite + React + Express app (single-process monolith)

FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy dependency manifests first for layer caching
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies for dev mode)
RUN npm ci

# Copy the rest of the source code
COPY . .

# Expose the app port (Express serves both API + Vite client)
EXPOSE 5001

# Start in development mode
CMD ["npm", "run", "dev"]
