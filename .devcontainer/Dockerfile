FROM mcr.microsoft.com/devcontainers/javascript-node:1-20-bullseye

# Install PostgreSQL client and Redis tools
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends postgresql-client redis-tools \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Install global npm packages
RUN npm install -g @nestjs/cli

# Create workspace directory
RUN mkdir -p /workspaces/speech-to-text

# Set the default user
USER node
