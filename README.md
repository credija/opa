# Opa - A XMPP Chat Client for the Web

- [Introduction](#introduction)
- [Features](#features)
- [Getting started](#getting-started)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Localization](#localization)
  - [Compatibility](#compatibility)
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
Has some feature in mind, suggestion or come across a bug? Open an [Issue](https://github.com/credija/opa/issues) so we can discuss 👍

# Features

Features Opa already has:
- [x] BOSH/WebSocket support
- [x] Multi language support 
  - Basic en-US | pt-BR for the time being, but you can add your own language by following the [Localization](#localization) section instructions of this README.
- [x] Responsive for desktop screens (up to 1024x768)
- [x] One-to-one chat
- [x] Basic emoji using keywords
  - Credits to Tweemoji for the emoji arts
- [x] Profile presence change option
- [x] Automatic presence change when away
  - After 20 minutes without performing any action in the app
- [x] Profile avatar change and delete option. 
  - Your XMPP server must support V-Card.

- [x] Contacts organized by group (Like Pidgin)
- [x] Contacts details. 
  - Your XMPP server must support V-Card.
- [x] Contacts search

- [x] Browser tab icon change when has a new message
- [x] Browser desktop notification 
  - 1 minute interval.
- [x] Sound desktop notification 
  - 1 minute interval.
- [x] Option to show/hide offline contacts
- [x] Option to enable Night/Day mode
- [x] Conversation history from server. 
  - Your XMPP server must support these protocols:
  - [MSM](https://xmpp.org/extensions/xep-0313.html)
  - [RSM](https://xmpp.org/extensions/xep-0059.html)
  - Note: The client always searches the history on the server, meaning the conversation history is not cached locally.

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
- [ ] Download other users avatar on demand
- [ ] Encrypted key:values of LocalStorage

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

The installation with Docker is very straightforward. You will, however, need to connect to your XMPP server. To do that you need to overwrite the /config/app-config.json (explanation of each option in the config file is in [Configuration](#configuration)) file:
```bash
docker run --name opa -d --restart=always \
  --publish 8080:80 \
  --volume /opt/your-config.json:/usr/share/nginx/html/config/app-config.json \
  -m 256MB \
  credija/opa
```

Also, if you need to overwrite the HTTP server config (which is an NGINX), you will need to overwrite the nginx.conf like:
```bash
docker run --name opa -d --restart=always \
  --publish 8080:80 \
  -m 256MB \
  --volume /opt/your-nginx.conf:/etc/nginx/nginx.conf \
  credija/opa
```
___
Note: If you want to use a XMPP server in Docker we recommend our Openfire build which is available here: https://github.com/credija/openfire

## Configuration

To connect to a XMPP server you will need to overwrite the [app-config.json](public/config/app-config.json). The options are these:
- **VUE_APP_XMPP_SERVER_ADDRESS**: The address for the HTTP/S BOSH or WSS WebSocket connection.
- **VUE_APP_XMPP_SERVER_DOMAIN**: Your chat domain.
- **VUE_APP_EMOJI_SERVER**: The server where the emoji arts will be downloaded from:
  - This app already has the emojis it uses on its static folder so you only need to append "emoji/" to the domain where the app will be hosted, like: `opa.credija.com.br/emoji/`
- **VUE_APP_LOCALE**: The locale need to be set in the format "language-country", like "en-us", "pt-br", etc since this value will be used to format date through the app.

## Localization

Opa has a plug-n-play structure for localizations, who are get from 'i18n' folder in /public/config. 

If you want to test Opa but it doesn't has your language you can develop your own translation to the app following the example provided by [en-us.json](public/config/i18n/en-us.json). 

Once finished just put the translation on the 'i18n' folder and change your app-config.json **VUE_APP_LOCALE** option to the language code you choose. 

**Note:** It's important to remember that the file needs to follow the 'language-country.json' format which is the same used in the **VUE_APP_LOCALE** option.

**Important:** If you develop a translation don't be afraid and send a pull request on the 'public/config/i18n' folder so it can be added by default on the next updates of Opa!

## Compatibility

Tested Browsers:
- Google Chrome
- Firefox
- Opera
- Microsoft Edge

Not Tested:
- IE
- Safari

____

Tested XMPP Servers:
- Ignite Realtime: Openfire Server

# Credits

- Thanks to the IT team of [Sicoob Credija](https://credija.com.br) which provided support, testing and infrastructure for the development of this project.

- Thanks [VueJS](https://github.com/vuejs/vue), [Element-UI](https://github.com/ElemeFE/element) and [StropheJS](https://github.com/strophe/strophejs) for the core libraries of this project.

- The emojis used in this app comes from the [Twemoji](https://github.com/twitter/twemoji) project and are licensed under CC-BY 4.0.

