import ObjectUtils from '@/utils/object-utils';

export default {
  constructor(store) {
    this.store = store;
    return this;
  },

  saveConfig(chatConfig) {
    const chatConfigNew = ObjectUtils.cloneObject(chatConfig);
    this.store.dispatch('chat/updateChatConfig', chatConfigNew);
    localStorage.setItem('chat-config', JSON.stringify(chatConfig));
  },

  loadConfig() {
    let chatConfig = JSON.parse(localStorage.getItem('chat-config'));
    if (chatConfig) {
      this.store.dispatch('chat/updateChatConfig', chatConfig);
    } else {
      chatConfig = { showOffline: false, soundNotification: false, darkMode: false };
      this.store.dispatch('chat/updateChatConfig', chatConfig);
      localStorage.setItem('chat-config', JSON.stringify(chatConfig));
    }
  }
};
