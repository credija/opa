FROM credija/nginx
MAINTAINER kevinfaveridev@gmail.com

COPY . /usr/opa-build

WORKDIR /usr/opa-build

RUN apt-get update \
 && curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash \
 && nvm install node \
 && npm install \
 && npm run build

COPY dist/. /usr/share/nginx/html

WORKDIR /usr

RUN rm -rf opa-build

EXPOSE 80/tcp
