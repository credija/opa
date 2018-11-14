import PresenceEnum from '@/enums/presence-enum';
import ContactDetails from '@/components/contact-details/contact-details.vue';
import MessageParser from '@/services/message-parser';

let XmppService, EmojiService = null;

export default {
  name: 'ChatBox',
  components: { 'contact-details': ContactDetails },
  props: [],
  data() {
    return {
      isSendingMessage: false,
      chatBoxForm: {
        message: '',
      },
      formRules: {
        message: [
          { required: true, message: this.$t('chatbox.messageRequired'), trigger: 'none' },
        ],
      },
      signalTimeout: null,
      isTyping: false,
      showContactDetails: false,
      emojiList: EmojiService.emojiArray()
    };
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
      if (this.activeConversation.contact.presence.id === 'dnd') {
        presenceValue = this.$t('profile.busyPresence');
      } else if (this.activeConversation.contact.presence.id === 'away') {
        presenceValue = this.$t('profile.awayPresence');
      } else {
        presenceValue = this.activeConversation.contact.presence.value;
      }
      return presenceValue;
    }
  },
  watch: {
    activeConversation: function (val) {
      if (val !== null) this.chatBoxForm.message = val.chatboxState;
    }
  },
  beforeCreate() {
    if (process.browser) {
      XmppService = require('@/services/xmpp-service').default.constructor(this.$store);
      EmojiService = require('@/services/emoji-service').default;
    }
  },
  methods: {
    chatBoxFormSubmit() {
      this.isSendingMessage = true;
      this.$refs.chatBoxForm.validate((valid) => {
        if (valid) {
          this.isSendingMessage = true;
          this.send();
          this.isSendingMessage = false;
        } else {
          this.isSendingMessage = false;
        }
      });
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
        stamp: newDate.toLocaleString(this.appLocale), 
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
      const thisComponent = this;
      setTimeout(function () {
        const messageBox = thisComponent.$el.querySelector('#messageBox');
        if (messageBox !== undefined) messageBox.scrollTop = messageBox.scrollHeight;
      });
    },
    getPresenceColor(idPresence) {
      return PresenceEnum.getIconColor(idPresence).value;
    },
    minimizeActiveConversation() {
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
        XmppService.sendChatSignal(vueContext.activeConversation.contact.username, 'paused');
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
    getEmojiImg(emoji) {
      return EmojiService.getEmojiImg(emoji.codepoint);
    },
    selectEmoji(emoji) {
      this.chatBoxForm.message += ' ' + emoji.shortcut + ' ';
      const chatBoxTextarea = document.getElementById('chatbox-textarea');
      if (chatBoxTextarea) chatBoxTextarea.focus();
    },
    parseMessage(msg) {
      return MessageParser.parseChatboxMessage(msg);
    }
  },
};
