import ObjectUtils from '@/utils/object-utils';

// TODO: Codificar chaves do perfil e diferenciar por perfil e não somente por instalação de navegador
export default {
  constructor(store) {
    this.store = store;
    return this;
  },

  saveConfig(chatConfig) {
    const chatConfigNew = ObjectUtils.cloneObject(chatConfig);
    this.store.dispatch('chat/updateChatConfig', chatConfigNew);
    localStorage.setItem('chat-config', JSON.stringify(chatConfig));
    
    this.store.dispatch('app/updateAppLocale', chatConfigNew.countryConfig);
  },

  loadConfig() {
    let chatConfig = JSON.parse(localStorage.getItem('chat-config'));
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
      localStorage.setItem('chat-config', JSON.stringify(chatConfig));
    }
  }
};
