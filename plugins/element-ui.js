import Vue from 'vue';
import { 
  Container, Main, Form, FormItem, Col, Row, 
  Alert, Input, Button, Card, Loading, MessageBox, Dialog, 
  Collapse, CollapseItem, Popover, Select, Option, Notification
} from 'element-ui';
import lang from 'element-ui/lib/locale/lang/en';
import locale from 'element-ui/lib/locale';
import '@/global-styles/element-variables.scss';

export default () => {
  locale.use(lang);

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
  Vue.use(Loading.directive);
  Vue.use(Dialog);
  Vue.use(Collapse);
  Vue.use(CollapseItem);
  Vue.use(Popover);
  Vue.use(Select);
  Vue.use(Option);

  Vue.prototype.$notify = Notification;
  Vue.prototype.$confirm = MessageBox.confirm;
  Vue.prototype.$alert = MessageBox.alert;
}
