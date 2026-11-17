# Build stage
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
# nginx.conf se procesa como plantilla al arrancar (envsubst de la imagen oficial).
# Solo se sustituyen variables MEDIAMTX_* para no tocar variables propias de nginx ($host, $uri...).
# MEDIAMTX_READ_AUTH = base64("reader:<MEDIA_READ_TOKEN>"); vacío = no se envía credencial a MediaMTX.
ENV NGINX_ENVSUBST_FILTER=MEDIAMTX_ \
    MEDIAMTX_READ_AUTH=""
COPY nginx.conf /etc/nginx/templates/default.conf.template

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
