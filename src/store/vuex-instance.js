import Vue from 'vue';
import Vuex from 'vuex';
import AppModule from './modules/app/index';
import ChatModule from './modules/chat/index';

Vue.use(Vuex);

export default new Vuex.Store({
  strict: false,
  modules: {
    app: AppModule,
    chat: ChatModule
  },
});
