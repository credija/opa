import MessageParser from '@/services/message-parser';

export default {
  name: 'CoolTextarea',
  props: ['content'],
  data() {
    return {
      savedRange: window.getSelection().getRangeAt(0),
    }
  },
  methods: {
    // TODO: Verificar como colocar o foco no cool-textarea a partir de outros componentes
    // TODO: Verificar como pegar os valores entre conversações de forma que o conteudo (estado do chatbox) seja restaurado ao mudar de janelas
    // TODO: Verificar se é deletado da lista de conversações o estado do chatbox quando fecha-se uma janela
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
      const content = event.target.innerHTML;
      event.stopPropagation();
      event.preventDefault();

      if (this.savedRange.startOffset === this.savedRange.endOffset 
        && content.length === 0) {
        window.document.execCommand('insertHTML', false, '\n');
        window.document.execCommand('insertHTML', false, '\n');
      } else if (this.savedRange.startOffset === this.savedRange.endOffset 
        && content.length !== 0 
        && this.savedRange.endOffset === content.length) {
        window.document.execCommand('insertHTML', false, '\n');
        window.document.execCommand('insertHTML', false, '\n');
      } else {
        window.document.execCommand('insertHTML', false, '\n');
      }
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
    addText(text) {
      // TODO: Verificar bug quando o input não foi focado nenhuma vez ainda
      // Talvez seja possivel criando um range selection no element em questão
      const doc = this.$el;
      doc.focus();

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
