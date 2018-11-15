import MessageParser from '@/services/message-parser';

export default {
  name: 'CoolTextarea',
  props: ['content'],
  data() {
    return {
      savedRange: window.getSelection().getRangeAt(0),
    }
  },
  watch: {
      content: function () {
        console.log('this.content', this.content);
      }
  },
  methods: {
    // TODO: Conteudo bugando e criando mais de um nó de texto dentro da div, 
    // as vezes cria um nonblocking space o que acaba bugando o componente todo
    updateContent(content) {
      console.log('content', content);
    },
    enterKey(ev) {
      console.log('ENTER KEY PRESSED', ev);
    },
    onPaste(pasteEvent) {
      var clipboardData, pastedData;

      pasteEvent.stopPropagation();
      pasteEvent.preventDefault();

      clipboardData = pasteEvent.clipboardData || window.clipboardData;
      pastedData = clipboardData.getData('Text');
      this.pasteSelection(pastedData);
      console.log('pastedData', pastedData);
    },
    pasteSelection(pastedData) {
      console.log('this.content', this.content);
      // TODO: Tratar todas as situações, no caso quando são iguais e 
      // quando não são (existe uma seleção que precisa ser substituida)
      if (this.savedRange.startOffset === this.savedRange.endOffset) {
        this.content = this.content.substr(0, this.savedRange.startOffset) + pastedData + this.content.substr(this.savedRange.endOffset);
        this.content = this.content.replace(/&nbsp;/g,'');
      }
    },
    saveSelection(){
      if (window.getSelection) {
        this.savedRange = window.getSelection().getRangeAt(0);
      }
      else if (document.selection) { 
        this.savedRange = document.selection.createRange();  
      } 
      console.log('this.savedRange', this.savedRange);
    },
    restoreSelection(){
      const doc = this.$el;
      doc.focus();
      if (this.savedRange != null) {
        if (window.getSelection)  {
            var s = window.getSelection();
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
