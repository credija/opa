import Vue from 'vue'
import { library, config } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { 
  faUser, faPlane, faChevronCircleRight, faCircle, 
  faClock, faTimes, faComment,
  faCheck, faMinus, faSmile, faCommentAlt,
  faBell, faBellSlash, faUserSlash, 
  faSun, faMoon, faUndo, faKey, faUserCog,
  faEnvelope, faLock, faArrowCircleRight, faLanguage, faSync
} from '@fortawesome/free-solid-svg-icons';

export default () => {
  config.autoAddCss = false;

  library.add(faUser, faPlane, faChevronCircleRight, faCircle, 
    faClock, faTimes, faComment,
    faCheck, faMinus, faSmile, faCommentAlt,
    faBell, faBellSlash, faUserSlash, 
    faSun, faMoon, faUndo, faKey, faUserCog,
    faEnvelope, faLock, faArrowCircleRight, faLanguage, faSync);

  Vue.component('font-awesome-icon', FontAwesomeIcon);
}
