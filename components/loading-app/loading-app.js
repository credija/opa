export default {
  name: 'LoadingApp',
  computed: {
    isAppLoading() {
      return this.$store.state.app.isAppLoading;
    },
  },
};
