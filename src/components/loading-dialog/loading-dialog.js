import { faEnvelope } from '@fortawesome/free-solid-svg-icons';

export default {
  name: 'LoadingDialog',
  components: {},
  props: [],
  data() {
    return {

    };
  },
  computed: {
    envelopeIcon() {
      return faEnvelope;
    },
    isChatReady() {
      return this.$store.state.app.isChatReady;
    },
  },
  mounted() {
  },
  methods: {

  },
};
