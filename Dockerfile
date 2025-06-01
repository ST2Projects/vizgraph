LABEL authors="st2projects"
LABEL org.opencontainers.image.source=https://github.com/st2projects/vizgraph

# builder stage
FROM node:20-alpine AS builder

WORKDIR /
ENV TEST=false
ENV ADAPTER=node
COPY package*.json ./
RUN npm ci
COPY . .
COPY .env .
RUN npm run build

# production stage
FROM node:20-alpine

WORKDIR /
# Copy the built application
COPY --from=builder /build ./
# Copy package files for production dependencies
COPY --from=builder /package*.json ./
RUN npm ci --omit=dev

# Create data directory and set permissions
RUN mkdir -p /data

ENV PORT=3000
ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "index.js"]