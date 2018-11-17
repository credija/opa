import ChatBox from '@/components/chat-box/chat-box.vue';
import LoadingApp from '@/components/loading-app/loading-app.vue';
import ConfirmTabDialog from '@/components/confirm-tab-dialog/confirm-tab-dialog.vue';
import ContactList from '@/components/contact-list/contact-list.vue';
import Conversations from '@/components/conversations/conversations.vue';
import ChatHeader from '@/components/chat-header/chat-header.vue';
import ScreenUtils from '@/utils/screen-utils';
import ChatConfig from '@/components/chat-config/chat-config.vue';
import PresenceEnum from '@/enums/presence-enum';

let XmppService, DateUtils = null;

export default {
  middleware: 'authenticated',
  name: 'Chat',
  components: { 
    'chat-box': ChatBox, 
    'loading-app': LoadingApp, 
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
      intervalAwayPresence: null,
      sizes: process.browser ? ScreenUtils.getSizeChat() : null,
    };
  },
  computed: {
    chatTimestamp() {
      return this.$store.state.app.chatTimestamp;
    },
    xmppClient() {
      return this.$store.state.app.xmppClient;
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
    },
  },
  beforeCreate() {
    if (process.browser) {
      XmppService = require('@/services/xmpp-service').default.constructor(this.$store);
      DateUtils = require('@/utils/date-utils').default.constructor(this.$store);

      // Show confirm close message
      const ctx = this;
      window.onbeforeunload = function() {
        if (ctx.$router.currentRoute.path === '/chat') {
          return true;
        }
      };

      // Delete credentials from LocalStorage when close tab
      window.onunload = function() {
        if (ctx.$router.currentRoute.path === '/chat') {
          const client = ctx.$store.state.app.xmppClient;
          client.options.sync = true;
          client.flush();
          client.disconnect();
        }
      };

      window.onresize = function() {
        ctx.sizes = ScreenUtils.getSizeChat();
        ctx.$nuxt.$emit('RE_RENDER_CHATBOX');
      };

      // Set browser zoom to default (100%)
      document.body.style.webkitTransform = 'scale(1)';
      document.body.style.msTransform = 'scale(100)';
      document.body.style.transform = 'scale(1)';
      document.body.style.zoom = screen.logicalXDPI / screen.deviceXDPI;
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
