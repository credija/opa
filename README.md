# Opa - A XMPP Chat Client for the Web

- [Introduction](#introduction)
- [Features](#features)
- [Getting started](#getting-started)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Localization](#localization)
  - [Logs](#logs)
- [Credits](#credits)

# Introduction

**Opa** is an **open-source XMPP chat client for the Web (SPA)** entirely built on top of **Vue** and **ElementUI** that follows the coolest trends out there ~~bye bye Flash and Desktop clients~~! 

![alt text](https://i.imgur.com/7bYOo8w.png "Landing Page Opa")

_**Trivia**_: "Opa", among many meanings in Brazil, is also used informally as a greeting!

**Opa** boasts a modern design having a clean interface that offers a good user experience. The interface is inspired by numerous web apps that already exist in the Javascript environment, such as **WhatsApp Web**, **Telegram Web**, **Discord**, **Rocket Chat**, etc...

![alt text](https://i.imgur.com/CMlniuk.png "Opa Chat 1")

**Opa** was born as an internal project to fill the **absence of an XMPP client** that did not need an **installation on each machine**, was **developed with current techs**, had a **modern design** and supported **common features** for a chat in a corporate environment.

![alt text](https://i.imgur.com/Etj88t9.png "Opa Chat 2")

A demo is available here: opa.github.io

# Features

Features Opa already has:
- [x] Multi language support (basic en-US | pt-BR for the time being, but you can add your own language by following the [Localization](#localization) section of this README)
- [x] Responsive up to 1366x768 (below that the layout will be broken)
- [x] One-to-one chat
- [x] Basic emoji using keywords (Credits to Tweemoji for the emoji arts)
- [x] Profile presence change option (Online, Busy and Away)
- [x] Automatic presence change when away (20 minutes)
- [x] Profile avatar change and delete option. Your XMPP server must support V-Card.

- [x] Contacts organized by group (Like Pidgin)
- [x] Contacts details. Your XMPP server must support V-Card.
- [x] Contacts search

- [x] Browser tab icon change when has new message
- [x] Browser desktop notification (1 minute interval)
- [x] Sound desktop notification (1 minute interval)
- [x] Option to show/hide offline contacts
- [x] Option to enable Night/Day mode
- [x] Conversation history from server. Your XMPP server must support these protocols:
  ---> [MSM](https://xmpp.org/extensions/xep-0313.html)
  ---> [RSM](https://xmpp.org/extensions/xep-0059.html)
  Note: The client always searches the history on the server, meaning the conversation history is not cached locally.

___

Features Opa that are under development (not necessarily in that order):
- [ ] Support for users who are not in any group
- [ ] Profile status message change option
- [ ] Group chat

- [ ] Popular video sites, like Youtube, embedding in messages
- [ ] Popular social networks posts embedding in messages
- [ ] Better images embedding in messages with support to maximize
- [ ] Fully featured chatbox to preview emoji, video, and images before sending
- [ ] Emoji using emoji unicodes rather than keywords

- [ ] Language configurable by the user
- [ ] Notification interval configurable by the user
- [ ] Presence change interval configurable by the user
- [ ] Better responsive layout

___

Features that are not currently being developed but may be in the future:
- [ ] Voice Chat
- [ ] Video Chat
- [ ] Room Chat
- [ ] Mobile support

# Getting Started

The initial idea of Opa was to be a plug-n-play client to any XMPP server and this was what influenced the decision to be a SPA and not a server-side-rendered application. 
Following this you have two ways of running this app:
- Cloning, configuration and building from the source, then hosting the /dist folder
- Using the Docker container provided and overwriting the global configuration file

## Installation
![alt text](https://www.docker.com/sites/default/files/social/docker_twitter_share_new.png "Docker Logo")

The installation with Docker is very straightforward:
```bash
docker run --name opa -d --restart=always \
  --publish 8080:80 \
  -m 256MB \
  credija/opa:lts
```

You will, of course, need to connect to your XMPP server. To do that you need to overwrite the /config/app-config.json (explanation of each option in the config file is in the next section) file:
```bash
docker run --name opa -d --restart=always \
  --publish 8080:80 \
  --volume /opt/your-config.json:/usr/share/nginx/html/config/app-config.json \
  -m 256MB \
  credija/opa:lts
```

Also, if you need to overwrite the HTTP server config (which is an NGINX), you will need to overwrite the nginx.conf file:
```bash
docker run --name opa -d --restart=always \
  --publish 8080:80 \
  -m 256MB \
  --volume /opt/your-nginx.conf:/etc/nginx/nginx.conf \
  credija/opa:lts
```
___
Note: If you want to use a XMPP server in Docker we recommend our Openfire build which is available here: https://github.com/credija/openfire

## Configuration

## Localization

## Logs

# Credits

