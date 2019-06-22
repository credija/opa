import ProfileConfigService from '@/services/profile-config-service';
import ObjectUtils from '@/utils/object-utils';

export default {
  name: 'CountryConfig',
  components: {},
  props: ['showCountryConfig'],
  data() {
    return {
      chatConfigForm: ObjectUtils.cloneObject(
        this.$store.state.chat.chatConfig
      ),
      countryConfig: 'en-us',
      countryArray: ['en-us', 'pt-br', 'de-de']
    };
  },
  computed: {
    appConfig() {
      return this.$store.state.app.appConfig;
    }
  },
  mounted() {
    if (this.chatConfigForm.countryConfig !== undefined) {
      this.countryConfig = this.chatConfigForm.countryConfig;
    } else {
      this.countryConfig = this.appConfig.APP_LOCALE;
    }
  },
  methods: {
    handleClose() {
      this.$emit('update:showCountryConfig', false);
    },
    clickCountry(country) {
      this.countryConfig = country;
    },
    saveCountryConfig() {
      const ctx = this;
      this.chatConfigForm.countryConfig = JSON.parse(
        JSON.stringify(this.countryConfig)
      );

      this.$store.dispatch('app/updateIsAppLoading', true);
      setTimeout(function() {
        ProfileConfigService.saveConfig(ctx.chatConfigForm);
        ctx.$i18n.locale = JSON.parse(
          JSON.stringify(ctx.chatConfigForm.countryConfig)
        );
        ctx.$store.dispatch('app/updateIsAppLoading', false);
        ctx.handleClose();
      }, 500);
    }
  }
};
