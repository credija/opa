import MessageParser from '@/services/message-parser';

export default {
  name: 'CoolTextarea',
  props: ['content'],
  data() {
    return {
      savedRange: window.getSelection().getRangeAt(0),
    }
  },
  computed: {
    activeConversation() {
      return this.$store.state.chat.activeConversation;
    },
  },
  created() {
    this.$nuxt.$on('COOL_TEXTAREA_FOCUS', () => {
      this.cleanText();
      this.focus();
      if (this.activeConversation.chatboxState !== '')  {
        this.addText(this.activeConversation.chatboxState);
      }    
    });
  },
  beforeDestroy() {
    this.$nuxt.$off('COOL_TEXTAREA_FOCUS');
  },
  // TODO: Set chatbox state when minimizing some conversation
  methods: {
    updateContent(event) {
      let content = event.target.innerHTML;

      content = MessageParser.replaceEmojiWithAltAttribute(content);
      content = MessageParser.unescapeHtml(content);

      this.$emit('update:content', content);
      this.$emit('contentChanged');
    },
    enterKey(event) {
      // TODO: Deixar enter mais suave 
      // (testar mais para ver se foi solucionado, e ver também de colocar o cursor 
      // pointer seguindo os newlines inseridos, que as vezes nao acontece)
      event.stopPropagation();
      event.preventDefault();
      if (event.shiftKey === false) {
        this.$emit('enterKey');
      }
    },
    shiftEnterKey(event) {
      event.stopPropagation();
      event.preventDefault();

      this.addText('\n');
      this.addText('\n');
    },
    onPaste(pasteEvent) {
      var clipboardData, pastedData;

      pasteEvent.stopPropagation();
      pasteEvent.preventDefault();

      clipboardData = pasteEvent.clipboardData || window.clipboardData;
      pastedData = clipboardData.getData('Text');
      pastedData = MessageParser.escapeHTML(pastedData);
      pastedData = MessageParser.convertUnicodeToTwemoji(pastedData);

      window.document.execCommand('insertHTML', false, pastedData);
    },
    focus() {
      const doc = this.$el;
      const childNode = doc.childNodes[0];
      doc.focus();

      if (childNode === undefined) {
        const textNode = document.createTextNode("");
        doc.appendChild(textNode);
        const range = document.createRange();
        const sel = window.getSelection();
        range.setStart(doc.childNodes[0], 0);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        this.saveSelection();
      }
    },
    addText(text) {
      this.focus();

      text = MessageParser.escapeHTML(text);
      text = MessageParser.convertUnicodeToTwemoji(text);

      window.document.execCommand('insertHTML', false, text);
      this.saveSelection();
    },
    cleanText() {
      this.$el.innerHTML = '';
    },
    saveSelection(){
      if (window.getSelection) {
        this.savedRange = window.getSelection().getRangeAt(0);
      } else if (document.selection) { 
        this.savedRange = document.selection.createRange();  
      } 
    },
    restoreSelection(){
      const doc = this.$el;
      doc.focus();
      if (this.savedRange != null) {
        if (window.getSelection)  {
          const s = window.getSelection();
          if (s.rangeCount > 0) {
            s.removeAllRanges();
          }
          s.addRange(this.savedRange);
        } else if (document.createRange)  {
          window.getSelection().addRange(this.savedRange);
        } else if (document.selection)  {
          this.savedRange.select();
        }
      }
    },
  }
};
