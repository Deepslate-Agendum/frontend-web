# syntax=docker/dockerfile:1

FROM nginx:bookworm
COPY ./media /usr/share/nginx/html

EXPOSE 80