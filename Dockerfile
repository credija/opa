FROM credija/nginx:lts
MAINTAINER kevinfaveridev@gmail.com

COPY . /usr/opa-build

WORKDIR /usr/opa-build

RUN apt-get update && apt-get install -y \
	curl \
	python \
	make \
	g++
  
RUN apt-get update \
 && curl -sL https://deb.nodesource.com/setup_11.x | bash - \
 && apt-get install -y nodejs \
 && npm install \
 && npm run build

COPY dist/. /usr/share/nginx/html

WORKDIR /usr

RUN rm -rf opa-build

EXPOSE 80/tcp
