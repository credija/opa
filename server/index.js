const express = require('express');
const consola = require('consola');
const { Nuxt, Builder } = require('nuxt');
const app = express();
const host = process.env.HOST || '10.22.50.80';
const port = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL;

app.set('port', port);

let config = require('../nuxt.config.js');

async function start() {
  const nuxt = new Nuxt(config);
  if (config.dev) {
    const builder = new Builder(nuxt);
    await builder.build();
  }

  app.use(nuxt.render);

  app.listen(port, host);
  consola.ready({
    message: `Opa is now running on the address: http://${host}:${port}`,
    badge: true
  });
  consola.info({
    message: `BaseURL: ${BASE_URL !== undefined ? BASE_URL : '/'}`,
    badge: true
  });
}
start();
