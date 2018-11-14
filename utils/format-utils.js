export default {
  getBase64FromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const encoded = reader.result.replace(/^.*;base64,/, '');
        resolve(encoded);
      };
      reader.onerror = error => reject(error);
    });
  }
};
