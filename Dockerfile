FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
# ngx-toastr currently declares Angular 21 peers while this app uses Angular 22.
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/school_stats_portal/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]