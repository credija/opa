import PresenceEnum from '@/enums/presence-enum';
import ArrayUtils from '@/utils/array-utils';
import includes from 'lodash.includes';
import RemoveAccents from 'remove-accents';
import MessageParser from '@/services/message-parser';

let XmppService = null;

export default {
  name: 'ContactList',
  components: {},
  props: ['showContactList'],
  watch: {
    showContactList: function (newVal) {
      if (newVal === false) {
        this.searchTerm = '';
      } else {
        this.focusContactSearch();
      }
    }
  },
  data() {
    return {
      activeAccordion: -1,
      searchTerm: '',
      searchedRosterList: [],
    };
  },
  computed: {
    rosterListByGroup() {
      return ArrayUtils.getRosterByGroup(this.rosterList);
    },
    rosterList() {
      return this.$store.state.app.rosterList;
    },
    conversationList() {
      return this.$store.state.chat.conversationList;
    },
    activeConversation() {
      return this.$store.state.chat.activeConversation;
    },
    showOffline() {
      const chatConfig = this.$store.state.chat.chatConfig;
      if (chatConfig) {
        return chatConfig.showOffline;
      }
      return false;
    },
    chatConfig() {
      return this.$store.state.chat.chatConfig;
    },
  },
  beforeCreate() {
    if (process.browser) {
      XmppService = require('@/services/xmpp-service').default.constructor(this.$store);
    }
  },
  mounted() {
    this.focusContactSearch();
  },
  methods: {
    getPresenceBorderColor(idPresence) {
      return PresenceEnum.getBorderColor(idPresence).value;
    },
    openConversation(contact) {
      this.changePresenceUserAction();
      let conversation = this.conversationList.find(conversationFind => 
        conversationFind.contact.username.toUpperCase() === 
        contact.username.toUpperCase());

      if (conversation === undefined) {
        conversation = { 
          contact, 
          list: [], 
          numUnreadMsgs: 0, 
          isTyping: false,
          chatboxState: '',
          oldConversation: {
            lastStamp: null,
            lastMessageId: '',
            lastRetrievedId: '',
            isLoading: false,
            list: []
          }
        };
        XmppService.setLastMessageId(conversation);
      } else {
        this.$store.dispatch('chat/clearUnreadCounterConversation', conversation);
      }

      let coolTextarea = document.getElementById('cool-textarea');
      if (coolTextarea) {
        let content = coolTextarea.innerHTML;
        content = MessageParser.replaceEmojiWithAltAttribute(content);
        content = MessageParser.unescapeHtml(content);

        this.$store.dispatch('chat/setChatboxStateConversation', { 
          conversation: this.activeConversation, 
          chatboxState: content
        });
      }

      this.$store.dispatch('chat/updateActiveConversation', conversation);
      this.$emit('switchActiveMenu');

      setTimeout(function () {
        coolTextarea = document.getElementById('cool-textarea');
        const messageBoxDoc = document.getElementById('messageBox');
        if (messageBoxDoc) messageBoxDoc.scrollTop = messageBoxDoc.scrollHeight;
        if (coolTextarea) {
          this.$nuxt.$emit('COOL_TEXTAREA_FOCUS'); 
        }
      });
    },
    searchContactByName() {
      if (this.searchTerm.length > 2) {
        this.searchedRosterList = this.rosterList
          .filter(obj => includes(
            RemoveAccents.remove(obj.name.toUpperCase()), 
            RemoveAccents.remove(this.searchTerm.toUpperCase())
          ));
      } else {
        this.searchedRosterList = [];
      }
    },
    showOfflineContact(contact) {
      if (contact.presence.id === 'off' && !this.showOffline) {
        return false;
      }
      return true;
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
    focusContactSearch() {
      setTimeout(function () {
        const contactSearchInput = document.getElementById('contact-search');
        if (contactSearchInput) contactSearchInput.focus();
      });
    }
  },
};
