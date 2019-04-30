import PresenceEnum from '@/enums/presence-enum';
import ArrayUtils from '@/utils/array-utils';
import includes from 'lodash.includes';
import RemoveAccents from 'remove-accents';

let XmppService, DocTitleService, FaviconService = null;

export default {
  name: 'ContactList',
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
    isLoadingRoster() {
      return this.$store.state.app.isLoadingRoster;
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
      DocTitleService = require('@/services/doc-title-service').default.constructor(this.$store);
      FaviconService = require('@/services/favicon-service').default.constructor(this.$store);
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
        if (conversation.numUnreadMsgs !== 0) {
          const numUnreadConversation = this.$store.state.chat.numUnreadConversation;
          this.$store.dispatch('chat/updateNumUnreadConversation', numUnreadConversation - 1);
          FaviconService.updateFavicon();
          DocTitleService.updateTitle();
        }
        this.$store.dispatch('chat/clearUnreadCounterConversation', conversation);
      }

      this.saveChatboxState();

      this.$store.dispatch('chat/updateActiveConversation', conversation);
      this.$emit('switchActiveMenu');

      setTimeout(function () {
        const coolTextarea = document.getElementById('cool-textarea');
        if (coolTextarea) {
          this.$nuxt.$emit('COOL_TEXTAREA_FOCUS');
        }
      });

      this.$store.dispatch('chat/updateLockAutoLoadOldMessages', false);
      this.scrollMessageBoxToBottom();
    },
    searchContactByName() {
      if (this.searchTerm.length > 2) {
        this.searchedRosterList = this.rosterList
          .filter(obj => includes(
            RemoveAccents.remove(obj.name.toUpperCase()), 
            RemoveAccents.remove(this.searchTerm.toUpperCase())
          ) && 
          obj.group !== 'UNKNOWN');
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
    },

    getProfileAvatar(username) {
      XmppService.updateUserAvatar(username);
    }
  },
};
