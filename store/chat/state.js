export const state = () => ({
  conversationList: [],
  delayedMessageList: [],
  delayIncomingMessages: false,
  activeConversation: null,
  chatboxEmoji: 'confused',
  lastNotification: new Date(),
  chatConfig: null,
  numUnreadConversation: 0,
  lastMessageSentStamp: new Date(),
  isPresenceAway: false,
  lastPresence: 'off',
  lockAutoLoadOldMessages: false,
});

export default state;
