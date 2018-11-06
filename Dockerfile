FROM credija/nginx:lts
MAINTAINER kevinfaveridev@gmail.com

COPY . /opt/opa-build

WORKDIR /opt/opa-build

RUN apt-get update && apt-get install -y \
	curl \
	python \
	make \
  gnupg \
	g++
  
RUN curl -sL https://deb.nodesource.com/setup_11.x | bash - \
 && apt-get install -y nodejs \
 && npm install \
 && npm run build \
 && cp -r /opt/opa-build/dist/* /usr/share/nginx/html/ \
 && ls /usr/share/nginx/html/

WORKDIR /opt

RUN rm -rf opa-build

EXPOSE 80/tcp
