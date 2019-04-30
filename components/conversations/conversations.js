import PresenceEnum from '@/enums/presence-enum';
import ObjectUtils from '@/utils/object-utils';
import MessageParser from '@/services/message-parser';

let XmppService, DocTitleService, FaviconService = null;

export default {
  name: 'Conversations',
  props: [],
  data() {
    return {

    };
  },
  computed: {
    conversationList() {
      return this.$store.state.chat.conversationList;
    },
    activeConversation() {
      return this.$store.state.chat.activeConversation;
    },
    isDisconnected() {
      return this.$store.state.app.isDisconnected;
    },
    chatConfig() {
      return this.$store.state.chat.chatConfig;
    },
    appLocale() {
      return this.$store.state.app.appLocale;
    },
  },
  beforeCreate() {
    if (process.browser) {
      XmppService = require('@/services/xmpp-service').default.constructor(this.$store);
      DocTitleService = require('@/services/doc-title-service').default.constructor(this.$store);
      FaviconService = require('@/services/favicon-service').default.constructor(this.$store);
    }
  },
  methods: {
    onClickConversation(conversation) {
      this.changePresenceUserAction();
      
      if (conversation.numUnreadMsgs !== 0) {
        const numUnreadConversation = this.$store.state.chat.numUnreadConversation;
        this.$store.dispatch('chat/updateNumUnreadConversation', numUnreadConversation - 1);
        FaviconService.updateFavicon();
        DocTitleService.updateTitle();
      }

      this.saveChatboxState();

      if (this.activeConversation !== null) {
        XmppService.sendChatSignal(this.activeConversation.contact.username, 'paused');
      }

      this.$store.dispatch('chat/clearUnreadCounterConversation', conversation);
      
      this.$store.dispatch('chat/updateActiveConversation', conversation);
      setTimeout(function () {
        const coolTextarea = document.getElementById('cool-textarea');
        if (coolTextarea) {
          this.$nuxt.$emit('COOL_TEXTAREA_FOCUS');
        }
      });
      
      this.scrollMessageBoxToBottom();
    },
    getLastMessage(conversation) {
      let lastMessage = {};
      lastMessage.msg = '';
      lastMessage = JSON.parse(JSON.stringify(conversation.list[conversation.list.length - 1]));
      lastMessage.stampDate = new Date(lastMessage.stampDate);
      lastMessage.msg = MessageParser.parseLastMessageConversation(lastMessage.msg); 
      return lastMessage;
    },
    getPresenceBorderColor(idPresence) {
      return PresenceEnum.getBorderColor(idPresence).value;
    },
    isConversationActive(conversation) {
      let bolConversationActive = false;
      if (conversation.contact.username 
        === ObjectUtils.getValidUsername(() => this.activeConversation.contact.username)) {
        bolConversationActive = true;
      }
      return bolConversationActive;
    },
    profileImageSrc(username) {
      const profileImageList = this.$store.state.app.profileImageList;
      const profileImageObj = profileImageList.find(profileImage => 
        profileImage.username.toUpperCase() === username.toUpperCase());
      let imgSrc = null;
      if (profileImageObj !== undefined 
        && profileImageObj.bin) {
        imgSrc = 'data:' + profileImageObj.type + ';base64,' + profileImageObj.bin;
      }
      return imgSrc;
    },
    isLastOwnMessage(conversation) {
      let bolOwnMessage = false;

      if (conversation.list.length !== 0 
        && conversation.list[conversation.list.length - 1].ownMessage) {
        bolOwnMessage = true;
      }

      return bolOwnMessage;
    },
    getProfileAvatar(username) {
      XmppService.updateUserAvatar(username);
    }
  },
};
