import ChatBox from '@/components/chat-box/chat-box.vue';
import LoadingApp from '@/components/loading-app/loading-app.vue';
import ContactList from '@/components/contact-list/contact-list.vue';
import Conversations from '@/components/conversations/conversations.vue';
import ChatHeader from '@/components/chat-header/chat-header.vue';
import ScreenUtils from '@/utils/screen-utils';
import ChatConfig from '@/components/chat-config/chat-config.vue';
import PresenceEnum from '@/enums/presence-enum';

let XmppService,
  ProfileConfigService,
  DateUtils = null;

export default {
  middleware: 'authenticated',
  name: 'Chat',
  components: {
    'chat-box': ChatBox,
    'loading-app': LoadingApp,
    'contact-list': ContactList,
    'chat-header': ChatHeader,
    'chat-config': ChatConfig,
    conversations: Conversations
  },
  props: [],
  data() {
    return {
      showContactList: false,
      intervalAwayPresence: null,
      sizes: process.browser ? ScreenUtils.getSizeChat() : null
    };
  },
  computed: {
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
    activeConversation() {
      return this.$store.state.chat.activeConversation;
    }
  },
  beforeCreate() {
    if (process.browser) {
      XmppService = require('@/services/xmpp-service').default.constructor(
        this.$store
      );
      DateUtils = require('@/utils/date-utils').default.constructor(
        this.$store
      );
      ProfileConfigService = require('@/services/profile-config-service').default.constructor(
        this.$store
      );

      // Show confirm close message
      const ctx = this;
      window.onbeforeunload = function() {
        if (ctx.$router.currentRoute.path === '/chat') {
          return true;
        }
      };

      // Actions when close tab
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

      ProfileConfigService.loadConfig();

      if (
        this.$store.state.chat.chatConfig.countryConfig !== undefined &&
        this.$store.state.chat.chatConfig.countryConfig !== null
      ) {
        this.$i18n.locale = this.$store.state.chat.chatConfig.countryConfig;
        this.$store.dispatch(
          'app/updateAppLocale',
          this.$store.state.chat.chatConfig.countryConfig
        );
      }
    }
  },
  mounted() {
    const vueContext = this;
    this.intervalAwayPresence = setInterval(function() {
      if (
        DateUtils.isDateLastMessageSentMinutesOlder(15) &&
        vueContext.isPresenceAway === false &&
        vueContext.authUser.presence.id !== 'away'
      ) {
        XmppService.sendChangePresenceSignal('away');
        vueContext.$store.dispatch(
          'app/updateAuthUserPresence',
          PresenceEnum.getPresenceById('away')
        );
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
  }
};
