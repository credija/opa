import Vue from 'vue';
import XmppService from '@/services/xmpp-service';
import PresenceEnum from '@/enums/presence-enum';
import MessageParser from '@/services/message-parser';
import ArrayUtils from '@/utils/array-utils';

export default ({ store }) => {
  Vue.prototype.dispatchHappyEmoji = () => {
    store.dispatch('chat/updateChatboxEmoji', 'happy');
  };
  Vue.prototype.dispatchThinkingEmoji = () => {
    store.dispatch('chat/updateChatboxEmoji', 'thinking');
  };
  Vue.prototype.dispatchPensiveEmoji = () => {
    store.dispatch('chat/updateChatboxEmoji', 'pensive');
  };
  Vue.prototype.dispatchConfusedEmoji = () => {
    store.dispatch('chat/updateChatboxEmoji', 'confused');
  };
  Vue.prototype.changePresenceUserAction = () => {
    store.dispatch('chat/updateLastMessageSentStamp', new Date());
    if (store.state.chat.isPresenceAway) {
      XmppService.constructor(store).sendChangePresenceSignal(
        store.state.chat.lastPresence
      );
      store.dispatch(
        'app/updateAuthUserPresence',
        PresenceEnum.getPresenceById(store.state.chat.lastPresence)
      );
      store.dispatch('chat/updateIsPresenceAway', false);
    }
  };
  Vue.prototype.saveChatboxState = () => {
    const coolTextarea = document.getElementById('cool-textarea');
    if (coolTextarea) {
      let content = coolTextarea.innerHTML;
      content = MessageParser.replaceEmojiWithAltAttribute(content);
      content = MessageParser.unescapeHtml(content);

      store.dispatch('chat/setChatboxStateConversation', {
        conversation: store.state.chat.activeConversation,
        chatboxState: content
      });
    }
  };
  Vue.prototype.scrollMessageBoxToBottom = () => {
    setTimeout(function() {
      const messageBox = document.getElementById('message-box');
      if (messageBox !== undefined) {
        messageBox.scrollTop =
          messageBox.scrollHeight !== null ? messageBox.scrollHeight : 0;
      }
    });
  };
};
