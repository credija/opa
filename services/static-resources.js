import Axios from 'axios';

export default {
  audio: {
    getNotificationAudio() {
      return Axios.get('/audio/notification.mp3',  { responseType: 'blob' });
    }
  }
}
