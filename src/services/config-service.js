import AxiosLocal from '@services/axios-local-service';

export default {
  async getConfigFile() {
    const appConfig = await AxiosLocal.getAppConfigFile()
      .then((res) => {
        return res.data;
      })
      .catch(() => {
        return {
          VUE_APP_XMPP_SERVER_IS_HTTPS: true,
          VUE_APP_XMPP_SERVER_HTTP: 'http://chat-domain:7070/http-bind',
          VUE_APP_XMPP_SERVER_HTTPS: 'https://chat-domain:7443/http-bind',
          VUE_APP_XMPP_SERVER_DOMAIN: 'chat',
          VUE_APP_EMOJI_SERVER: 'https://twemoji.maxcdn.com/36x36/',
          VUE_APP_LOCALE: 'en-us'
        };
      });
    return appConfig;
  }
};
