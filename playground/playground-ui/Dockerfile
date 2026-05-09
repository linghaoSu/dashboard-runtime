ARG NGINX_IMAGE_VERSION=1.21.6-alpine
ARG FORCE_CACHE=1
FROM docker.m.daocloud.io/nginx:${NGINX_IMAGE_VERSION}

COPY dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories
RUN apk -U upgrade

RUN chown -R nginx:nginx /var/cache/nginx && \
        chown -R nginx:nginx /var/log/nginx && \
        chown -R nginx:nginx /etc/nginx/conf.d
RUN touch /var/run/nginx.pid && \
        chown -R nginx:nginx /var/run/nginx.pid

USER nginx

EXPOSE 8080
