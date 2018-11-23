import LoadingApp from '@/components/loading-app/loading-app.vue';
let XmppService, ProfileConfigService, ConfigService = null;

export default {
  name: 'Login',
  components: { 
    'loading-app': LoadingApp, 
  },
  data() {
    return {
      loginForm: {
        username: '',
        password: '',
      },
      formRules: {
        username: [
          { required: true, message: 'Este campo é obrigatório.', trigger: 'none' },
        ],
        password: [
          { required: true, message: 'Este campo é obrigatório.', trigger: 'none' },
        ],
      },
    };
  },
  computed: {
    isLoginExpired() {
      if (!this.$route.query.loginExpired === true) {
        return false;
      }
      return true;
    },
    isCredentialsInvalid() {
      if (!this.$route.query.invalidCredentials === true) {
        return false;
      }
      return true;
    },
    isLogout() {
      if (!this.$route.query.logout === true) {
        return false;
      }
      return true;
    },
    isLogging() {
      return this.$store.state.app.isLogging;
    }
  },
  beforeCreate() {
    if (process.browser) {
      XmppService = require('@/services/xmpp-service').default.constructor(this.$store, this.$i18n);
      ConfigService = require('@/services/config-service').default;
      ProfileConfigService = require('@/services/profile-config-service').default.constructor(this.$store);
      const staticBase = this.$nuxt._router.options.base;
      ConfigService.getConfigFile(staticBase).then((appConfig) => {
        this.$store.dispatch('app/updateAppConfig', appConfig);
        this.$store.dispatch('app/updateAppLocale', appConfig.VUE_APP_LOCALE);
        this.$i18n.locale = appConfig.VUE_APP_LOCALE;
        ProfileConfigService.loadConfig();
        this.$store.dispatch('app/updateIsAppLoading', false);
      });
    }
  },
  mounted() {
    this.$store.dispatch('chat/updateConversationList', []);
    this.$store.dispatch('chat/updateActiveConversation', null);
    this.$store.dispatch('app/updateRosterList', []);
    this.$store.dispatch('app/updateProfileImageList', []);
  },
  methods: {
    loginFormSubmit() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.$refs.loginForm.clearValidate();
          this.$store.dispatch('app/updateIsLogging', true);
          XmppService.loginXmpp(this.loginForm.username, this.loginForm.password);
        }
      });
    },
  },
};
