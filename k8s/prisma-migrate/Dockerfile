FROM node:20-alpine

# Install prisma CLI globally so the init container can run migrations without installing at runtime
RUN npm install -g prisma@7.4.0

WORKDIR /app

ENTRYPOINT ["/bin/sh", "-c"]
