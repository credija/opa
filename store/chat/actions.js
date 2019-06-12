import * as types from './mutation-types';

const actions = {
  // Chatbox Global States
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

  // Conversation List
  addConversationToList({ commit }, conversation) {
    commit(types.ADD_CONVERSATION_TO_LIST, { conversation });
  },
  updateConversationList({ commit }, conversationList) {
    commit(types.UPDATE_CONVERSATION_LIST, {
      conversationList
    });
  },
  reorderConversationList({ commit }, conversation) {
    commit(types.REORDER_CONVERSATION_LIST, { conversation });
  },
  removeConversationFromList({ commit }, conversation) {
    commit(types.REMOVE_CONVERSATION_FROM_LIST, { conversation });
  },
  reorderConversationByConversation({ commit }, conversation) {
    commit(types.REORDER_CONVERSATIONS_BY_CONVERSATION, { conversation });
  },

  // Conversation
  addMessageToConversation({ commit }, addMessageToConversation) {
    const { conversation, messageToAdd } = addMessageToConversation;
    commit(types.ADD_MESSAGE_TO_CONVERSATION, { conversation, messageToAdd });
  },
  clearUnreadCounterConversation({ commit }, conversation) {
    commit(types.CLEAR_UNREAD_COUNTER_CONVERSATION, { conversation });
  },
  plusUnreadCounterConversation({ commit }, conversation) {
    commit(types.PLUS_UNREAD_COUNTER_CONVERSATION, { conversation });
  },
  setChatboxStateConversation({ commit }, setChatboxStateConversation) {
    const { conversation, chatboxState } = setChatboxStateConversation;
    commit(types.SET_CHATBOX_STATE_CONVERSATION, { conversation, chatboxState });
  },
  updateActiveConversation({ commit }, activeConversation) {
    commit(types.UPDATE_ACTIVE_CONVERSATION, {
      activeConversation
    });
  },
  updateActiveConversationIsTyping({ commit }, isTyping) {
    commit(types.UPDATE_ACTIVE_CONVERSATION_IS_TYPING, {
      isTyping
    });
  },

  // Old Conversation
  updateOldConversation({ commit }, updateOldConversation) {
    const { conversation, oldConversation } = updateOldConversation;
    commit(types.UPDATE_OLD_CONVERSATION, { conversation, oldConversation });
  },
  updateOldConversationLastStamp({ commit }, updateOldConversationLastStamp) {
    const { oldConversation, lastStamp } = updateOldConversationLastStamp;
    commit(types.UPDATE_OLD_CONVERSATION_LAST_STAMP, { oldConversation, lastStamp });
  },
  updateOldConversationNoResult({ commit }, updateOldConversationNoResult) {
    const { oldConversation, bool } = updateOldConversationNoResult;
    commit(types.UPDATE_OLD_CONVERSATION_NO_RESULT, { oldConversation, bool });
  },
  updateOldConversationLastRetrievedId({ commit }, updateOldConversationLastRetrievedId) {
    const { oldConversation, lastRetrievedId } = updateOldConversationLastRetrievedId;
    commit(types.UPDATE_OLD_CONVERSATION_LAST_RETRIEVED_ID, { oldConversation, lastRetrievedId });
  },
  updateOldConversationLastMessageId({ commit }, updateOldConversationLastMessageId) {
    const { oldConversation, lastMessageId } = updateOldConversationLastMessageId;
    commit(types.UPDATE_OLD_CONVERSATION_LAST_MESSAGE_ID, { oldConversation, lastMessageId });
  },
  addMessageListToOldConversation({ commit }, addMessageListToOldConversation) {
    const { oldConversation, messageList } = addMessageListToOldConversation;
    commit(types.ADD_MESSAGE_LIST_TO_OLD_CONVERSATION, { oldConversation, messageList });
  },
  updateLockAutoLoadOldMessages({ commit }, bool) {
    commit(types.UPDATE_LOCK_AUTO_LOAD_OLD_MESSAGES, {
      bool
    });
  },
  clearOldConversation({ commit }, oldConversation) {
    commit(types.CLEAR_OLD_CONVERSATION, {
      oldConversation
    });
  },
};

export default actions;
