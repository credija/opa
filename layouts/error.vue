<template>
  <div id="error-container">
    <section class="error-container">
      <span>4</span>
      <span>
        <span class="screen-reader-text">0</span>
      </span>
      <span>4</span>
    </section>
    <div class="link-container">
      <nuxt-link to="/">
        <el-button
          type="primary"
          plain
        >
          {{ button404Message }}
        </el-button>
      </nuxt-link>
    </div>
  </div>
</template>

<style scoped lang="css">
@import url('https://fonts.googleapis.com/css?family=Catamaran:400,800');
.error-container {
  text-align: center;
  font-size: 180px;
  font-family: 'Catamaran', sans-serif;
  font-weight: 800;
}
.error-container > span {
  display: inline-block;
  line-height: 0.7;
  position: relative;
  color: #ffb485;
}
.error-container > span {
  display: inline-block;
  position: relative;
  vertical-align: middle;
}
.error-container > span:nth-of-type(1) {
  color: #d1f2a5;
  animation: colordancing 4s infinite;
}
.error-container > span:nth-of-type(3) {
  color: #f56991;
  animation: colordancing2 4s infinite;
}
.error-container > span:nth-of-type(2) {
  width: 120px;
  height: 120px;
  border-radius: 999px;
}
.error-container > span:nth-of-type(2):before,
.error-container > span:nth-of-type(2):after {
  border-radius: 0%;
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: inherit;
  height: inherit;
  border-radius: 999px;
  box-shadow: inset 30px 0 0 rgba(209, 242, 165, 0.4),
    inset 0 30px 0 rgba(239, 250, 180, 0.4),
    inset -30px 0 0 rgba(12, 211, 168, 0.4),
    inset 0 -30px 0 rgba(29, 136, 131, 0.4);
  animation: shadowsdancing 4s infinite;
}
.error-container > span:nth-of-type(2):before {
  -webkit-transform: rotate(45deg);
  -moz-transform: rotate(45deg);
  transform: rotate(45deg);
}

.screen-reader-text {
  position: absolute;
  top: -9999em;
  left: -9999em;
}
@keyframes shadowsdancing {
  0% {
    box-shadow: inset 30px 0 0 rgba(209, 242, 165, 0.4),
      inset 0 30px 0 rgba(239, 250, 180, 0.4),
      inset -30px 0 0 rgba(12, 211, 168, 0.4),
      inset 0 -30px 0 rgba(29, 136, 131, 0.4);
  }
  25% {
    box-shadow: inset 30px 0 0 rgba(29, 136, 131, 0.4),
      inset 0 30px 0 rgba(209, 242, 165, 0.4),
      inset -30px 0 0 rgba(239, 250, 180, 0.4),
      inset 0 -30px 0 rgba(12, 211, 168, 0.4);
  }
  50% {
    box-shadow: inset 30px 0 0 rgba(12, 211, 168, 0.4),
      inset 0 30px 0 rgba(29, 136, 131, 0.4),
      inset -30px 0 0 rgba(209, 242, 165, 0.4),
      inset 0 -30px 0 rgba(239, 250, 180, 0.4);
  }
  75% {
    box-shadow: inset 30px 0 0 rgba(239, 250, 180, 0.4),
      inset 0 30px 0 rgba(12, 211, 168, 0.4),
      inset -30px 0 0 rgba(29, 136, 131, 0.4),
      inset 0 -30px 0 rgba(209, 242, 165, 0.4);
  }
  100% {
    box-shadow: inset 30px 0 0 rgba(209, 242, 165, 0.4),
      inset 0 30px 0 rgba(239, 250, 180, 0.4),
      inset -30px 0 0 rgba(12, 211, 168, 0.4),
      inset 0 -30px 0 rgba(29, 136, 131, 0.4);
  }
}
@keyframes colordancing {
  0% {
    color: #d1f2a5;
  }
  25% {
    color: #1d888366;
  }
  50% {
    color: #0cd3a866;
  }
  75% {
    color: #effab4;
  }
  100% {
    color: #d1f2a5;
  }
}
@keyframes colordancing2 {
  0% {
    color: #0cd3a866;
  }
  25% {
    color: #effab4;
  }
  50% {
    color: #d1f2a5;
  }
  75% {
    color: #1d888366;
  }
  100% {
    color: #0cd3a866;
  }
}
.link-container {
  text-align: center;
}
</style>

<script>
import ConfigService from '@/services/config-service';

export default {
  props: ['error'],
  computed: {
    button404Message() {
      return this.$t('page404.button');
    }
  },
  beforeCreate() {
    if (process.browser) {
      const staticBase = this.$nuxt._router.options.base;
      ConfigService.getConfigFile(staticBase).then(appConfig => {
        this.$store.dispatch('app/updateAppConfig', appConfig);
        this.$store.dispatch('app/updateAppLocale', appConfig.APP_LOCALE);

        if (
          typeof navigator.language === 'string' &&
          Object.keys(this.$i18n.messages).includes(
            navigator.language.toLowerCase()
          )
        ) {
          this.$i18n.locale = navigator.language.toLowerCase();
        } else {
          this.$i18n.locale = appConfig.APP_LOCALE;
        }
      });
    }
  },
  layout: 'error-layout'
};
</script>