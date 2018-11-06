import ProfileConfigService from '@services/profile-config-service';
import Push from 'push.js';
import { 
  faCommentAlt,
  faBell, faBellSlash, 
  faUser, faUserSlash, 
  faSun, faMoon 
} from '@fortawesome/free-solid-svg-icons';
import ObjectUtils from '@utils/object-utils';

export default {
  name: 'ChatConfig',
  components: {},
  props: ['showChatConfig'],
  data() {
    return {
      chatConfigForm: {},
      showErrorMessage: false,
    };
  },
  computed: {
    chatConfig() {
      return this.$store.state.chat.chatConfig;
    },
    soundNotificationMsg() {
      if (this.chatConfigForm.soundNotification === undefined 
        || this.chatConfigForm.soundNotification === false) {
        return this.$t('config.enableSoundNotification');
      }
      return this.$t('config.disableSoundNotification');
    },
    showOfflineMsg() {
      if (this.chatConfigForm.showOffline === undefined 
        || this.chatConfigForm.showOffline === false) {
        return this.$t('config.enableOfflineContacts');
      }
      return this.$t('config.disableOfflineContacts');
    },
    darkModeMsg() {
      if (this.chatConfigForm.darkMode === undefined 
        || this.chatConfigForm.darkMode === false) {
        return this.$t('config.enableDarkMode');
      }
      return this.$t('config.disableDarkMode');
    },
    commentIcon() {
      return faCommentAlt;
    },
    bellIcon() {
      return faBell;
    },
    bellSlashIcon() {
      return faBellSlash;
    },
    userIcon() {
      return faUser;
    },
    userSlashIcon() {
      return faUserSlash;
    },
    sunIcon() {
      return faSun;
    },
    moonIcon() {
      return faMoon;
    }
  },
  mounted() {
    this.chatConfigForm = ObjectUtils.cloneObject(this.chatConfig);
  },
  methods: {
    chatConfigFormSubmit() {
      ProfileConfigService.saveConfig(this.chatConfigForm);
    },
    changeSoundNotification() {
      this.changePresenceUserAction();
      if (this.chatConfigForm.soundNotification === undefined 
        || this.chatConfigForm.soundNotification === false) {
        this.chatConfigForm.soundNotification = true;
      } else {
        this.chatConfigForm.soundNotification = false;
      }
      ProfileConfigService.saveConfig(this.chatConfigForm);
    },
    changeShowOffline() {
      this.changePresenceUserAction();
      if (this.chatConfigForm.showOffline === undefined 
        || this.chatConfigForm.showOffline === false) {
        this.chatConfigForm.showOffline = true;
      } else {
        this.chatConfigForm.showOffline = false;
      }
      ProfileConfigService.saveConfig(this.chatConfigForm);
    },
    changeDarkTheme() {
      this.changePresenceUserAction();
      if (this.chatConfigForm.darkMode === undefined 
        || this.chatConfigForm.darkMode === false) {
        this.chatConfigForm.darkMode = true;
      } else {
        this.chatConfigForm.darkMode = false;
      }
      ProfileConfigService.saveConfig(this.chatConfigForm);
    },
    requestNotificationPermission() {
      this.changePresenceUserAction();
      Push.Permission.request(() => {
        this.showErrorMessage = false;
      }, () => {
        this.showErrorMessage = true;
      });
    },

  },
};
