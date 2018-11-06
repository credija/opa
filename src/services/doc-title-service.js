
import Store from '@store/vuex-instance';

export default {
  updateTitle() {
    const numUnreadConversation = Store.state.chat.numUnreadConversation;
    const title = this.getTitleById(numUnreadConversation);
    document.title = title.value;
  },
  titleArray() {
    return [ 
      { id: 0, value: 'Opa' },
      { id: 1, value: 'Opa (1)' },
      { id: 2, value: 'Opa (2)' },
      { id: 3, value: 'Opa (3)' },
      { id: 4, value: 'Opa (4)' },
      { id: 5, value: 'Opa (5)' },
      { id: 6, value: 'Opa (6)' },
      { id: 7, value: 'Opa (7)' },
      { id: 8, value: 'Opa (8)' },
      { id: 9, value: 'Opa (9)' },
      { id: 10, value: 'Opa (9+)' },
    ];
  },
  getTitleById(idTitle) {
    if (idTitle > 9) {
      return this.titleArray()[10];
    }
    return this.titleArray().find(title => title.id === idTitle);
  },
};
