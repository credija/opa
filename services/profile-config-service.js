import ObjectUtils from '@/utils/object-utils';
import StringUtils from '@/utils/string-utils';

export default {
  constructor(store) {
    this.store = store;
    return this;
  },

  saveConfig(chatConfig) {
    const client = this.store.state.app.xmppClient;
    const clientUsername = StringUtils.removeAfterInclChar(client.jid, '@');

    const chatConfigNew = ObjectUtils.cloneObject(chatConfig);
    this.store.dispatch('chat/updateChatConfig', chatConfigNew);
    localStorage.setItem(
      btoa(`chat-config-${clientUsername}`),
      btoa(JSON.stringify(chatConfig))
    );

    this.store.dispatch('app/updateAppLocale', chatConfigNew.countryConfig);
  },

  loadConfig() {
    const client = this.store.state.app.xmppClient;
    const clientUsername = StringUtils.removeAfterInclChar(client.jid, '@');

    let chatConfig = localStorage.getItem(
      btoa(`chat-config-${clientUsername}`)
    );
    if (chatConfig !== null) chatConfig = JSON.parse(atob(chatConfig));
    if (chatConfig) {
      this.store.dispatch('chat/updateChatConfig', chatConfig);
    } else {
      chatConfig = {
        showOffline: false,
        soundNotification: false,
        darkMode: false,
        countryConfig: this.store.state.app.appLocale
      };
      this.store.dispatch('chat/updateChatConfig', chatConfig);
      localStorage.setItem(
        btoa(`chat-config-${clientUsername}`),
        btoa(JSON.stringify(chatConfig))
      );
    }
  }
};
