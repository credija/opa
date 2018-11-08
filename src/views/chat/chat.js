import ChatBox from '@components/chat-box/chat-box.vue';
import LoadingDialog from '@components/loading-dialog/loading-dialog.vue';
import ConfirmTabDialog from '@components/confirm-tab-dialog/confirm-tab-dialog.vue';
import ContactList from '@components/contact-list/contact-list.vue';
import Conversations from '@components/conversations/conversations.vue';
import ChatHeader from '@components/chat-header/chat-header.vue';
import { faComment, faUndo } from '@fortawesome/free-solid-svg-icons';
import ScreenUtils from '@utils/screen-utils';
import ChatConfig from '@components/chat-config/chat-config.vue';
import DateUtils from '@utils/date-utils';
import XmppService from '@services/xmpp-service';
import PresenceEnum from '@enums/presence-enum';

export default {
  name: 'Chat',
  components: { 
    'chat-box': ChatBox, 
    'loading-dialog': LoadingDialog, 
    'confirm-tab-dialog': ConfirmTabDialog,
    'contact-list': ContactList,
    'chat-header': ChatHeader,
    'chat-config': ChatConfig,
    conversations: Conversations,
  },
  props: [],
  data() {
    return {
      showConfirmTabDialog: false,
      showContactList: false,
      disconnectedMessage: this.$t('chat.isDisconnectedMsg'),
      sizes: ScreenUtils.getSizeChat(),
      intervalAwayPresence: null,
    };
  },
  computed: {
    chatTimestamp() {
      return this.$store.state.app.chatTimestamp;
    },
    xmppClient() {
      return this.$store.state.app.xmppClient;
    },
    speechBubbleIcon() {
      return faComment;
    },
    undoIcon() {
      return faUndo;
    },
    isDisconnected() {
      return this.$store.state.app.isDisconnected;
    },
    chatConfig() {
      return this.$store.state.chat.chatConfig;
    },
    authUser() {
      return this.$store.state.app.authUser;
    },
    lastMessageSentStamp() {
      return this.$store.state.chat.lastMessageSentStamp;
    },
    isPresenceAway() {
      return this.$store.state.chat.isPresenceAway;
    },
    lastPresence() {
      return this.$store.state.chat.lastPresence;
    }
  },
  mounted() {
    const vueContext = this;
    this.intervalAwayPresence = setInterval(function() { 
      if (DateUtils.isDateLastMessageSentMinutesOlder(15) 
        && vueContext.isPresenceAway === false 
        && vueContext.authUser.presence.id !== 'away') {
        XmppService.sendChangePresenceSignal('away');
        vueContext.$store.dispatch('app/updateAuthUserPresence', PresenceEnum.getPresenceById('away'));
        vueContext.$store.dispatch('chat/updateIsPresenceAway', true);
      }
    }, 1000);
   
    const vueInstance = this;
    window.onresize = function() {
      vueInstance.sizes = ScreenUtils.getSizeChat();
    };
    const lsTimestamp = JSON.parse(localStorage.getItem('isLoggedChat'));
    const vueComponent = this;
    if (lsTimestamp !== null && lsTimestamp.value !== this.chatTimestamp) {
      this.showConfirmTabDialog = true;
    } else if (vueComponent.xmppClient === null) {
      vueComponent.$router.push('/login?loginExpired=true');
    }
  },
  beforeDestroy() {
    this.intervalAwayPresence = null;
  },
  methods: {
    switchActiveMenu() {
      this.changePresenceUserAction();
      if (this.showContactList) {
        this.dispatchConfusedEmoji();
        this.showContactList = false;
      } else {
        this.dispatchHappyEmoji();
        this.showContactList = true;
      }
    }
  },
};
