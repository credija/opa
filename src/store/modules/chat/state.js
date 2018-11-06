const state = {
  conversationList: [],
  activeConversation: null,
  chatboxEmoji: 'confused',
  lastNotification: new Date(),
  chatConfig: null,
  numUnreadConversation: 0,
  lastMessageSentStamp: new Date(),
  isPresenceAway: false,
  lastPresence: 'off'
};

export default state;
