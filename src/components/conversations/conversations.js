import PresenceEnum from '@enums/presence-enum';
import ObjectUtils from '@utils/object-utils';
import { faUser, faCheck } from '@fortawesome/free-solid-svg-icons';
import FaviconService from '@services/favicon-service';
import DocTitleService from '@services/doc-title-service';

export default {
  name: 'Conversations',
  components: {},
  props: [],
  data() {
    return {

    };
  },
  computed: {
    userIcon() {
      return faUser;
    },
    checkIcon() {
      return faCheck;
    },
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
  },
  mounted() {

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

      const chatBoxTextarea = document.getElementById('chatbox-textarea');
      if (chatBoxTextarea) {
        this.activeConversation.chatboxState = chatBoxTextarea.value;
      }

      conversation.numUnreadMsgs = 0;
      
      this.$store.dispatch('chat/updateActiveConversation', conversation);
      setTimeout(function () {
        const messageBoxDoc = document.getElementById('messageBox');
        if (messageBoxDoc) messageBoxDoc.scrollTop = messageBoxDoc.scrollHeight;
        if (chatBoxTextarea) chatBoxTextarea.focus();
      });
    },
    getLastMessage(conversation) {
      let lastMessage = '';
      if (conversation.list.length !== 0) {
        lastMessage = ObjectUtils.cloneObject(conversation.list[conversation.list.length - 1]);
      }

      lastMessage.msg = lastMessage.msg.replace(/<br\/>/g, '');
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
    }
  },
};
