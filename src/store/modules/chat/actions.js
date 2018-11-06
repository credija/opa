import * as types from '../../mutation-types';

const actions = {
  updateConversationList({ commit }, conversationList) {
    commit(types.UPDATE_CONVERSATION_LIST, {
      conversationList
    });
  },
  updateActiveConversation({ commit }, activeConversation) {
    commit(types.UPDATE_ACTIVE_CONVERSATION, {
      activeConversation
    });
  },
  updateChatboxEmoji({ commit }, chatboxEmoji) {
    commit(types.UPDATE_CHATBOX_EMOJI, {
      chatboxEmoji
    });
  },
  updateLastNotification({ commit }, lastNotification) {
    commit(types.UPDATE_LAST_NOTIFICATION, {
      lastNotification
    });
  },
  updateChatConfig({ commit }, chatConfig) {
    commit(types.UPDATE_CHAT_CONFIG, {
      chatConfig
    });
  },
  updateNumUnreadConversation({ commit }, numUnreadConversation) {
    commit(types.UPDATE_NUM_UNREAD_CONVERSATION, {
      numUnreadConversation
    });
  },
  updateLastMessageSentStamp({ commit }, lastMessageSentStamp) {
    commit(types.UPDATE_LAST_MESSAGE_SENT_STAMP, {
      lastMessageSentStamp
    });
  },
  updateIsPresenceAway({ commit }, isPresenceAway) {
    commit(types.UPDATE_IS_PRESENCE_AWAY, {
      isPresenceAway
    });
  },
  updateLastPresence({ commit }, lastPresence) {
    commit(types.UPDATE_LAST_PRESENCE, {
      lastPresence
    });
  },
};

export default actions;
