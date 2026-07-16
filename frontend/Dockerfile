# ---------- Build stage ----------
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration production

# ---------- Runtime stage ----------
FROM nginx:1.27-alpine AS runtime

# IMPORTANT: change to match the "projects" key in angular.json
ARG PROJECT_NAME=your-project-name
COPY --from=build /app/dist/${PROJECT_NAME}/browser /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]