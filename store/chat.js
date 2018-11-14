import State from './chat/state';
import Getters from './chat/getters';
import Actions from './chat/actions';
import Mutations from './chat/mutations';

const store = () => new Vuex.Store({
    state: State(),
    getters: Getters,
    actions: Actions,
    mutations: Mutations
  })

export default store;
