
import Store from '@store/vuex-instance';
import ObjectUtils from '@utils/object-utils';

export default {
  saveConfig(chatConfig) {
    const chatConfigNew = ObjectUtils.cloneObject(chatConfig);
    Store.dispatch('chat/updateChatConfig', chatConfigNew);
    localStorage.setItem('chat-config', JSON.stringify(chatConfig));
  },
  loadConfig() {
    let chatConfig = JSON.parse(localStorage.getItem('chat-config'));
    if (chatConfig) {
      Store.dispatch('chat/updateChatConfig', chatConfig);
    } else {
      chatConfig = { showOffline: false, soundNotification: false, darkMode: false };
      Store.dispatch('chat/updateChatConfig', chatConfig);
      localStorage.setItem('chat-config', JSON.stringify(chatConfig));
    }
  }
};
