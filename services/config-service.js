import Axios from 'axios';

export default {
  async getConfigFile() {
    let appConfigPath = null;
    
    if (process.env.isDev) {
      appConfigPath = `${process.env.baseUrl}/config/app-config-dev.json`;
    } else {
      appConfigPath = `${process.env.baseUrl}/config/app-config.json`;
    }

    const appConfig = await Axios.get(appConfigPath)
      .then((res) => {
        return res.data;
      })
      .catch(() => {
        return {
          VUE_APP_XMPP_SERVER_ADDRESS: 'http://chat:7070/http-bind',
          VUE_APP_XMPP_SERVER_DOMAIN: 'chat',
          VUE_APP_LOCALE: 'en-us'
        };
      });
    return appConfig;
  }
};