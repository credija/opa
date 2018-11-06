import * as types from '../../mutation-types';

const mutations = {
  [types.UPDATE_CONVERSATION_LIST](state, { conversationList }) {
    state.conversationList = conversationList;
  },
  [types.UPDATE_ACTIVE_CONVERSATION](state, { activeConversation }) {
    state.activeConversation = activeConversation;
  },
  [types.UPDATE_CHATBOX_EMOJI](state, { chatboxEmoji }) {
    state.chatboxEmoji = chatboxEmoji;
  },
  [types.UPDATE_LAST_NOTIFICATION](state, { lastNotification }) {
    state.lastNotification = lastNotification;
  },
  [types.UPDATE_CHAT_CONFIG](state, { chatConfig }) {
    state.chatConfig = chatConfig;
  },
  [types.UPDATE_NUM_UNREAD_CONVERSATION](state, { numUnreadConversation }) {
    state.numUnreadConversation = numUnreadConversation;
  },
  [types.UPDATE_LAST_MESSAGE_SENT_STAMP](state, { lastMessageSentStamp }) {
    state.lastMessageSentStamp = lastMessageSentStamp;
  },
  [types.UPDATE_IS_PRESENCE_AWAY](state, { isPresenceAway }) {
    state.isPresenceAway = isPresenceAway;
  },
  [types.UPDATE_LAST_PRESENCE](state, { lastPresence }) {
    state.lastPresence = lastPresence;
  },
};

export default mutations;
