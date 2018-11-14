import State from './app/state';
import Getters from './app/getters';
import Actions from './app/actions';
import Mutations from './app/mutations';

const store = () => new Vuex.Store({
    state: State(),
    getters: Getters,
    actions: Actions,
    mutations: Mutations
  })

export default store;
