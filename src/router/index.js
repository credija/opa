import VueRouter from 'vue-router';
import { LocaleService } from '@services/locale-service';

import BaseTemplate from '@templates/base-template/base-template.vue';
import Login from '@views/login/login.vue';
import Chat from '@views/chat/chat.vue';
import NotFound from '@views/not-found/not-found.vue';

const routes = [
  { 
    path: '/',
    redirect: '/login', 
    component: BaseTemplate,
    children: [
      { path: '/login', component: Login },
      { path: '/chat', component: Chat },
    ],
  },
  { path: '/not-found', component: NotFound },
  { path: '*', redirect: '/not-found' },
];

const router = new VueRouter({
  mode: 'history',
  routes,
});

router.beforeEach((to, from, next) => {
  LocaleService.loadLanguageAsync().then(() => next());
});

export default router;
