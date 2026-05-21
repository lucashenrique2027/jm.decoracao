import QRCode from 'qrcode';

/**
 * Transforma uma URL ou String em uma imagem Base64
 * @param {string} texto 
 */
export const gerarImagemQRCode = async (texto) => {
  try {
    
    const opcoes = {
      errorCorrectionLevel: 'M', 
      margin: 2,
      width: 300,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    };

    return await QRCode.toDataURL(texto, opcoes);
  } catch (err) {
    throw new Error("Falha física ao gerar o QR Code");
  }
};