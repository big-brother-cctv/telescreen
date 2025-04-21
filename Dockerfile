# Etapa 1: Construcción de la app Angular
FROM node:18 AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --frozen-lockfile

COPY . .

RUN npm run build --configuration production

FROM nginx:alpine

COPY --from=build /app/dist/video-stream-frontend /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
