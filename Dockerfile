# Use a lightweight Node 22 image
FROM node:24-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the root package files first to leverage Docker layer caching
COPY package.json package-lock.json* ./

# Copy the rest of the monorepo (apps and packages)
COPY . .

# Install dependencies across all workspaces
RUN npm install

# Build all workspaces (compiles appClient and appServer)
RUN npm run build

# Expose the port (Render will dynamically override this via the PORT env var)
EXPOSE 9208

# set production environment for runtime
ENV NODE_ENV=production

# Boot the Express server
CMD ["npm", "run", "start", "-w", "appServer"]