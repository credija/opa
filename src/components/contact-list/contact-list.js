import { faUser } from '@fortawesome/free-solid-svg-icons';
import PresenceEnum from '@enums/presence-enum';
import ArrayUtils from '@utils/array-utils';
import includes from 'lodash.includes';
import XmppService from '@services/xmpp-service';
import RemoveAccents from 'remove-accents';

export default {
  name: 'ContactList',
  components: {},
  props: [],
  data() {
    return {
      activeAccordion: -1,
      searchTerm: '',
      searchedRosterList: [],
    };
  },
  computed: {
    userIcon() {
      return faUser;
    },
    rosterList() {
      return this.$store.state.app.rosterList;
    },
    rosterListByGroup() {
      return ArrayUtils.getRosterByGroup(this.rosterList);
    },
    rosterFirstLoad() {
      return this.$store.state.app.rosterFirstLoad;
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
  mounted() {
    setTimeout(function () {
      const contactSearchInput = document.getElementById('contact-search');
      if (contactSearchInput) contactSearchInput.focus();
    });
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
        conversation.numUnreadMsgs = 0;
      }

      let chatBoxTextarea = document.getElementById('chatbox-textarea');
      if (chatBoxTextarea) {
        this.activeConversation.chatboxState = chatBoxTextarea.value;
      }

      this.$store.dispatch('chat/updateActiveConversation', conversation);
      this.$emit('switchActiveMenu');
      setTimeout(function () {
        chatBoxTextarea = document.getElementById('chatbox-textarea');
        const messageBoxDoc = document.getElementById('messageBox');
        if (messageBoxDoc) messageBoxDoc.scrollTop = messageBoxDoc.scrollHeight;
        if (chatBoxTextarea) chatBoxTextarea.focus();
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
    showOfflineContacts(contact) {
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
  },
};
