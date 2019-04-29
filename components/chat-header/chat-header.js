import PresenceEnum from '@/enums/presence-enum';

let XmppService = null;

export default {
  name: 'ChatHeader',
  props: ['showContactList'],
  data() {
    return {
      profileImgUpload: null,
      disconnectedMessage: this.$t('chat.isDisconnectedMsg'),
    };
  },
  computed: {
    presenceList() {
      return PresenceEnum.getPresenceEnumUser();
    },
    authUser() {
      return this.$store.state.app.authUser;
    },
    profileImageSrc() {
      let imgSrc = null;
      if (this.authUser !== undefined && this.authUser.photoBin) {
        imgSrc = 'data:' + this.authUser.photoType + ';base64,' + this.authUser.photoBin;
      }
      return imgSrc;
    },
    isDisconnected() {
      return this.$store.state.app.isDisconnected;
    },
    chatConfig() {
      return this.$store.state.chat.chatConfig;
    },
    numUnreadConversation() {
      return this.$store.state.chat.numUnreadConversation;
    }
  },
  beforeCreate() {
    if (process.browser) {
      XmppService = require('@/services/xmpp-service').default.constructor(this.$store);
    }
  },
  methods: {
    getPresenceColor(idPresence) {
      return PresenceEnum.getIconColor(idPresence).value;
    },
    sendChangePresenceSignal() {
      XmppService.sendChangePresenceSignal(this.authUser.presence.id);
      this.$store.dispatch('chat/updateLastMessageSentStamp', new Date());
      this.$store.dispatch('chat/updateLastPresence', this.authUser.presence.id);
      this.$store.dispatch('chat/updateIsPresenceAway', false);
    },
    uploadProfileImage() {
      this.changePresenceUserAction();
      const uploadInput = document.getElementById('profileimg-upload');
      uploadInput.click();
    },
    onFileChange(e) {
      const vueContext = this;

      const file = e.target.files[0];

      if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
        this.$notify({
          title: vueContext.$t('profile.avatarExtensionInvalid'),
          type: 'error'
        });
      } else if (file.size > 2097152) {
        this.$notify({
          title: vueContext.$t('profile.avatarSizeInvalid'),
          type: 'error'
        });
      } else {
        XmppService.updateProfileImage(file);
      }
    },
    emitSwitchActiveMenu() {
      this.$emit('switchActiveMenu');
    },
    goToLogin() {
      const vueContext = this;

      this.$confirm(
        vueContext.$t('profile.reLoginBody'),
        vueContext.$t('profile.reLoginTitle'),
        {
          confirmButtonText: 'OK',
          cancelButtonText: vueContext.$t('profile.cancelReLogin'),
          type: 'warning',
        },
      )
        .then(() => {
          this.$store.dispatch('app/updateIsAppLoading', true);
          this.$router.push('/');
        })
        .catch(() => {});
    },
    deletePhoto() {
      this.changePresenceUserAction();
      const vueContext = this;
      this.$confirm(
        vueContext.$t('profile.deleteAvatarBody'),
        vueContext.$t('profile.deleteAvatarTitle'),
        {
          confirmButtonText: 'OK',
          cancelButtonText: vueContext.$t('profile.cancelDeleteAvatar'),
          type: 'warning',
        },
      )
        .then(() => {
          return XmppService.deleteProfileImage();
        })
        .catch(() => {});
    },
    getPresenceLabeli18n(presence) {
      let presenceValue = '';

      if (presence.id === 'on') {
        presenceValue = this.$t('profile.onlinePresence');
      } else if (presence.id === 'dnd') {
        presenceValue = this.$t('profile.busyPresence');
      } else if (presence.id === 'away') {
        presenceValue = this.$t('profile.awayPresence');
      } else {
        presenceValue = this.$t('profile.offlinePresence');
      }

      return presenceValue;
    }
  },
};
