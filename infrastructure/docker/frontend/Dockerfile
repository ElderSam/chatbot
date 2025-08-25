# Simple Dockerfile for Vite React Frontend
FROM node:22-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install --frozen-lockfile || yarn install --frozen-lockfile || pnpm install --frozen-lockfile
RUN npm run build || yarn build || pnpm build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
