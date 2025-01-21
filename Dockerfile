# syntax=docker/dockerfile:1

FROM nginx:bookworm
COPY . /usr/share/nginx/html

EXPOSE 80