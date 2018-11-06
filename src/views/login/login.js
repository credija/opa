import { faUser, faLock, faArrowCircleRight } from '@fortawesome/free-solid-svg-icons';
import XmppService from '@services/xmpp-service';

export default {
  name: 'Login',
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
    userIcon() {
      return faUser;
    },
    lockIcon() {
      return faLock;
    },
    arrowRight() {
      return faArrowCircleRight;
    },
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
