import PresenceEnum from '@/enums/presence-enum';
import ContactDetails from '@/components/contact-details/contact-details.vue';
import MessageParser from '@/services/message-parser';
import CoolTextarea from '@/components/cool-textarea/cool-textarea.vue';
import { CoolPicker } from 'cool-emoji-picker';

import EmojiData from 'cool-emoji-picker/src/emoji-data/en/emoji-all-groups.json';
import EmojiGroups from 'cool-emoji-picker/src/emoji-data/emoji-groups.json';

let XmppService = null;

export default {
  name: 'ChatBox',
  components: { 
    'contact-details': ContactDetails,
    'cool-textarea': CoolTextarea,
    'coolpicker': CoolPicker
  },
  data() {
    return {
      isSendingMessage: false,
      chatBoxForm: {
        message: '',
      },
      signalTimeout: null,
      isTyping: false,
      showContactDetails: false,
      chatboxHeight: 0,
      chatboxMaxHeight: 0,

    };
  },
  created() {
    this.$nuxt.$on('RE_RENDER_CHATBOX', () => {
      let componentHeight = 0;
      const screenHeight = window.innerHeight;
      
      if (screenHeight >= 910) {
        componentHeight = 680;
      } else if (screenHeight >= 760) {
        componentHeight = 540;
      } else if (screenHeight >= 660) {
        componentHeight = 500;
      } else {
        componentHeight = 470;
      }

      const newHeight = componentHeight - (this.chatboxHeight - 17);

      this.chatboxMaxHeight = componentHeight;
      this.setMessageBoxHeight(newHeight);
      
      this.scrollMessageBoxToBottom();
    });
  },
  beforeDestroy() {
    this.$nuxt.$off('RE_RENDER_CHATBOX');
  },
  watch: {
    chatboxHeight: function (newVal, oldVal) {
      const messageBox = document.getElementById('message-box');

      if (oldVal === 0) {
        this.chatboxMaxHeight = messageBox.offsetHeight;
        if (newVal !== 17) {
          const newHeight = messageBox.offsetHeight - (newVal / 2);
          this.setMessageBoxHeight(newHeight);
        }
      } else if (newVal > oldVal && oldVal !== 0) {
        const newHeight = messageBox.offsetHeight - (newVal - oldVal);
        this.setMessageBoxHeight(newHeight);
      } else {
        const newHeight = messageBox.offsetHeight + (oldVal - newVal);
        if (this.chatboxMaxHeight >= newHeight) {
          this.setMessageBoxHeight(newHeight);
        }
      }

      this.scrollMessageBoxToBottom();
    },
  },
  computed: {
    xmppClient() {
      return this.$store.state.app.xmppClient;
    },
    activeContact() {
      if (this.activeConversation !== null) {
        return this.$store.state.chat.activeConversation.contact;
      }
      return null;
    },
    activeConversation() {
      return this.$store.state.chat.activeConversation;
    },
    conversationList() {
      return this.$store.state.chat.conversationList;
    },
    profileImageSrc() {
      const profileImageList = this.$store.state.app.profileImageList;
      const profileImageObj = profileImageList.find(profileImage => 
        profileImage.username.toUpperCase() === this.activeContact.username.toUpperCase());
      let imgSrc = null;
      if (profileImageObj !== undefined 
        && profileImageObj.bin) {
        imgSrc = 'data:' + profileImageObj.type + ';base64,' + profileImageObj.bin;
      }
      return imgSrc;
    },
    isDisconnected() {
      return this.$store.state.app.isDisconnected;
    },
    chatboxEmoji() {
      return this.$store.state.chat.chatboxEmoji;
    },
    chatConfig() {
      return this.$store.state.chat.chatConfig;
    },
    appLocale() {
      return this.$store.state.app.appLocale;
    },
    presenceValue() {
      let presenceValue = '';
      if (this.activeConversation.contact.presence.id === 'on') {
        presenceValue = this.$t('profile.onlinePresence');
      } else if (this.activeConversation.contact.presence.id === 'dnd') {
        presenceValue = this.$t('profile.busyPresence');
      } else if (this.activeConversation.contact.presence.id === 'away') {
        presenceValue = this.$t('profile.awayPresence');
      } else if (this.activeConversation.contact.presence.id === 'xa') {
        presenceValue = this.$t('profile.awayPresence');
      } else {
        presenceValue = this.$t('profile.offlinePresence');
      }
      return presenceValue;
    },
    emojiData() {
      return EmojiData;
    },
    emojiGroups() {
      return EmojiGroups;
    },
  },
  beforeCreate() {
    if (process.browser) {
      XmppService = require('@/services/xmpp-service').default.constructor(this.$store);
    }
  },
  methods: {
    submitMessage() {
      if (this.chatBoxForm.message.trim().length !== 0) {
        this.send();
      }
    },
    send() {
      this.changePresenceUserAction();
      const newDate = new Date();

      XmppService
        .sendMessage(this.chatBoxForm.message, this.activeConversation.contact.username, newDate);
      
      const conversation = this.conversationList.find(conversationFind => 
        conversationFind.contact.username.toUpperCase() === 
        this.activeConversation.contact.username.toUpperCase());
      
      if (this.activeConversation.list.length === 0) {
        newDate.setSeconds(newDate.getSeconds() - 5);
        this.$store.dispatch('chat/updateOldConversationLastStamp', { 
          oldConversation: this.activeConversation.oldConversation, 
          lastStamp: newDate.toISOString() 
        });
      }

      const messageToAdd = { 
        msg: this.chatBoxForm.message, 
        ownMessage: true, 
        stampDate: newDate 
      };

      if (conversation !== undefined) {
        this.$store.dispatch('chat/addMessageToConversation', { 
          messageList: conversation.list, 
          messageToAdd: messageToAdd 
        });
      } else {
        this.$store.dispatch('chat/addMessageToConversation', {
          messageList: this.activeConversation.list, 
          messageToAdd: messageToAdd 
        });
        this.$store.dispatch('chat/addConversationToList', this.activeConversation);
      }

      this.$store.dispatch('chat/reorderConversationByConversation', this.activeConversation);

      this.chatBoxForm.message = '';
      this.scrollMessageBoxToBottom();

      this.$refs.coolTextarea.cleanText();
      this.chatboxHeight = this.$refs.coolTextarea.$el.clientHeight;
    },
    getPresenceColor(idPresence) {
      return PresenceEnum.getIconColor(idPresence).value;
    },
    minimizeActiveConversation() {
      this.saveChatboxState();
      this.changePresenceUserAction();
      XmppService.sendChatSignal(this.activeConversation.contact.username, 'paused');
      this.$store.dispatch('chat/updateActiveConversation', null);
    },
    closeActiveConversation() {
      this.changePresenceUserAction();
      XmppService.sendChatSignal(this.activeConversation.contact.username, 'paused');
      this.$store.dispatch('chat/removeConversationFromList', this.activeConversation);
      this.$store.dispatch('chat/updateActiveConversation', null);
    },
    sendTypingSignal() {
      const vueContext = this;
      if (this.isTyping === false) {
        XmppService.sendChatSignal(this.activeConversation.contact.username, 'composing');
        this.isTyping = true;
      }

      clearTimeout(this.signalTimeout);
      this.signalTimeout = setTimeout(function () {
        if (vueContext.activeConversation !== null) {
          XmppService.sendChatSignal(vueContext.activeConversation.contact.username, 'paused');
        }
        vueContext.isTyping = false;
      }, 1000);
    },
    clickContactDetails() {
      this.changePresenceUserAction();
      this.showContactDetails = true;
    },
    closeContactDetails() {
      this.changePresenceUserAction();
      this.showContactDetails = false;
    },
    loadOldMessages() {
      this.changePresenceUserAction();
      XmppService.getOldMessages(this.activeConversation);
    },
    selectEmoji(emoji) {
      this.$refs.coolTextarea.addText(emoji);
    },
    parseMessage(msg) {
      return MessageParser.parseChatboxMessage(msg);
    },
    chatboxContentChanged() {
      this.chatboxHeight = this.$refs.coolTextarea.$el.clientHeight;
    },
    setMessageBoxHeight(height) {
      const messageBox = document.getElementById('message-box');
      if (messageBox !== undefined && messageBox !== null) {
        messageBox.style.height = height + 'px';
        messageBox.style.minHeight = height + 'px';
        messageBox.style.maxHeight = height + 'px';
      }
    }
  },
};
