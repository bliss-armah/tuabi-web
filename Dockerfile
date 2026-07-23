# ---- Build stage ----
# node:20 (Debian/glibc) ships a modern npm that installs @tailwindcss/oxide's
# Linux native binding correctly. We ALSO install the binary explicitly so the
# build never depends on npm's flaky optional-dependency resolution.
FROM node:20-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci && npm install --no-save @tailwindcss/oxide-linux-x64-gnu@4.3.3

COPY . .

# Vite inlines VITE_* at BUILD time — must be provided as a build arg.
# In Dokploy set VITE_API_BASE_URL (e.g. https://api.tuabi.muginasolutions.com).
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# ---- Serve stage ----
FROM nginx:alpine AS serve
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
