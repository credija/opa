export default {
  name: 'ContactDetails',
  components: {},
  props: ['activeContact', 'showContactDetails'],
  data() {
    return {};
  },
  computed: {
    profileImageSrc() {
      const profileImageList = this.$store.state.app.profileImageList;
      const profileImageObj = profileImageList.find(
        profileImage =>
          profileImage.username.toUpperCase() ===
          this.activeContact.username.toUpperCase()
      );
      let imgSrc = null;
      if (profileImageObj !== undefined && profileImageObj.bin) {
        imgSrc =
          'data:' + profileImageObj.type + ';base64,' + profileImageObj.bin;
      }
      return imgSrc;
    },
    chatConfig() {
      return this.$store.state.chat.chatConfig;
    }
  },
  mounted() {},
  methods: {
    handleClose() {
      this.$emit('closeContactDetails');
    }
  }
};
