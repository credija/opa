import Vue from 'vue';
import VueRouter from 'vue-router';

import { 
  Container, Main, Form, FormItem, Col, Row, 
  Alert, Input, Button, Card, Loading, MessageBox, Dialog, 
  Collapse, CollapseItem, Popover, Select, Option, Notification
} from 'element-ui';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import 'typeface-roboto';

import FilterUtils from '@utils/filter-utils';
import MixinUtils from '@utils/mixin-utils';

import ProfileConfigService from '@services/profile-config-service';
import ConfigService from '@services/config-service';

import { i18n } from '@services/locale-service';

import App from './components/app/app.vue';
import './main.scss';

import router from './router/index';
import store from './store/vuex-instance';

// Load App Config then run App
ConfigService.getConfigFile().then((appConfig) => {
  store.dispatch('app/updateAppConfig', appConfig);

  // Element UI components
  Vue.use(Container);
  Vue.use(Main);
  Vue.use(Form);
  Vue.use(FormItem);
  Vue.use(Col);
  Vue.use(Row);
  Vue.use(Alert);
  Vue.use(Input);
  Vue.use(Button);
  Vue.use(Card);
  Vue.use(Loading);
  Vue.use(Dialog);
  Vue.use(Collapse);
  Vue.use(CollapseItem);
  Vue.use(Popover);
  Vue.use(Select);
  Vue.use(Option);
  Vue.prototype.$notify = Notification;
  Vue.prototype.$confirm = MessageBox.confirm;
  Vue.prototype.$alert = MessageBox.alert;

  // Font Awesome Import
  Vue.component('font-awesome-icon', FontAwesomeIcon);

  // Router library
  Vue.router = router;
  Vue.use(VueRouter);

  // Fix for IE8 DateNow
  if (!Date.now) {
    Date.now = function() { return new Date().getTime(); };
  }

  // Show confirm close message
  window.onbeforeunload = function() {
    if (router.currentRoute.path === '/chat') {
      return true;
    }
  };

  // Delete credentials from LocalStorage when close tab
  window.onunload = function() {
    if (router.currentRoute.path === '/chat') {
      const client = store.state.app.xmppClient;
      client.options.sync = true;
      client.flush();
      client.disconnect();
      const chatTimestamp = store.state.app.chatTimestamp;
      const lsTimestamp = JSON.parse(localStorage.getItem('isLoggedChat'));
      if (lsTimestamp !== null && lsTimestamp.value === chatTimestamp) {
        window.localStorage.removeItem('isLoggedChat');
      }
    }
  };

  // Set browser zoom to default (100%)
  document.body.style.webkitTransform = 'scale(1)';
  document.body.style.msTransform = 'scale(100)';
  document.body.style.transform = 'scale(1)';
  document.body.style.zoom = screen.logicalXDPI / screen.deviceXDPI;

  // Filter
  Vue.filter('isDateToday', FilterUtils.isDateToday);

  // Global Mixins
  const globalDispatchs = MixinUtils.dispatchMixin();
  Vue.mixin(globalDispatchs);

  // Load Profile Chat Configs
  ProfileConfigService.loadConfig();

  new Vue({
    i18n,
    router,
    store,
    render: h => h(App),
  }).$mount('#app');
});
