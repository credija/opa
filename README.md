# Opa - A XMPP Chat Client for the Web

- [Introduction](#introduction)
- [Features](#features)
- [Requirements](#requirements)
- [Getting started](#getting-started)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Internationalization](#internationalization)
  - [Compatibility](#compatibility)
- [Credits](#credits)

# Introduction

<p align="center">
  <img src="https://i.imgur.com/eQsT8zn.png" alt="Logo Opa"/>
</p>

**Opa** is an **open-source XMPP chat client for the Web (SSR)** entirely built on top of **Vue**, **NuxtJS** and **ElementUI** that follows the coolest trends out there ~~bye bye Flash and Desktop clients~~!

_**Trivia**_: "Opa", among many meanings in Brazil, is also used informally as a greeting!

---

**Opa** boasts a modern design having a clean interface that offers a good user experience. The interface is inspired by numerous web apps that already exist in the Javascript environment, such as **WhatsApp Web**, **Telegram Web**, **Discord**, **Rocket Chat**, etc... It was born as an internal project to fill the **absence of an XMPP client** that did not need an **installation on each machine**, was **developed with current techs**, had a **modern design** and supported **common features** for a chat in a corporate environment.

---

Opa has a demo available which is at latest version. For testing there are two users:

Username: darth
Password: 1234

Username: luke
Password: 1234

The demo is available here, have fun: https://www.credija.com.br/opa-demo

---

Has some feature in mind, suggestion or come across a bug? Open an [Issue](https://github.com/credija/opa/issues) so we can discuss 👍

---

# Features

Check the features here: https://github.com/credija/opa/wiki/Features

# Requirements

Currently Opa uses https://polyfill.io/v3/polyfill.min.js?flags=gated for better support because your browser needs to support these three features:

- https://caniuse.com/#search=es6
- https://caniuse.com/#feat=flexbox
- https://caniuse.com/#feat=intersectionobserver
- https://caniuse.com/#feat=atob-btoa

Also, your XMPP server must support MSM/RSM (for message archiving).

# Getting Started

The initial idea of Opa was to be a plug-n-play client to any XMPP server.

Following this you have two ways of running this app:

- Building and running from source with NodeJS

- Using the Docker container provided and overwriting the global configuration file

## Installation

### NodeJS (From Source)

The installation with NodeJS will need you to install the package manager [Yarn](https://yarnpkg.com/pt-BR/). You can install Yarn on an NodeJS environment with this command:

```
npm install yarn -g
```

After installing Yarn you will need to clone the project into a folder. This folder will be where the Opa server will run from:

```
git clone https://github.com/credija/opa.git
```

After clonning the project you will need to navigate to this folder and run the command below to build and start Opa:

```
yarn build && yarn start
```

You will, however, need to connect to your XMPP server. To do that you need to overwrite the /your-project-clone-folder/static/config/app-config.json (explanation of each option in the config file is in [Configuration](#configuration) section).

### Docker

The installation with Docker is very straightforward. You will, however, need to connect to your XMPP server. To do that you need to overwrite the /app/static/config/app-config.json (explanation of each option in the config file is in [Configuration](#configuration) section):

```
docker run --name opa -d --restart=always \
  --publish 3000:3000 \
  --volume /opt/your-config.json:/app/static/config/app-config.json \
  -m 512MB \
  credija/opa
```

---

Note: If you want to use a XMPP server in Docker we recommend our Openfire build which is available here: https://github.com/credija/openfire

## Configuration

To connect to an XMPP server you will need to overwrite the [app-config.json](https://github.com/credija/opa/blob/master/static/config/app-config.json). The options are these:

- **XMPP_SERVER_ADDRESS**: The address for the HTTP/S BOSH or WSS WebSocket connection.
- **XMPP_SERVER_DOMAIN**: Your chat domain.
- **APP_LOCALE**: The locale needs to be set in the format "language-country", like "en-us", "pt-br", etc since this value will be used to format date through the app.

## Internationalization

Opa has a plug-n-play structure for locales, which are stored in /static/locales.

There is right now these languages:

- en-US
- pt-BR
- de-DE (Thanks @matzeso for this translation)

If you want to test Opa but it doesn't have your language you can develop your own translation to the app following the example provided by [en-us.json](https://github.com/credija/opa/blob/master/static/locales/en-us.json).

Once finished send a [pull request](https://github.com/credija/opa/pulls) on the develop branch with your translation so we can add it to Opa.

**Note:** It's important to remember that the file needs to follow the 'language-country.json' format which is the same used in the **APP_LOCALE** option.

## Compatibility

Tested Browsers:

- Google Chrome
- Firefox
- Opera
- Microsoft Edge

Not Tested:

- IE
- Safari

---

Tested XMPP Servers:

- Ignite Realtime: Openfire Server version 4.3.2
- ejabberd version 18.04

# Credits

- Thanks to the IT team of [Sicoob Credija](https://credija.com.br) which provided support, testing, and infrastructure for the development of this project.

- Thanks [VueJS](https://github.com/vuejs/vue), [NuxtJS](https://github.com/nuxt/nuxt.js/), [Element-UI](https://github.com/ElemeFE/element), [StropheJS](https://github.com/strophe/strophejs) for the core libraries of this project.

- The emojis used in this app comes from the [Twemoji](https://github.com/twitter/twemoji) project and are licensed under CC-BY 4.0.
