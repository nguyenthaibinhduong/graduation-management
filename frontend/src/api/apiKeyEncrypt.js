import CryptoJS from 'crypto-js';
const apiKey = import.meta.env.VITE_API_KEY; // Trùng với server
const apiSecret = import.meta.env.VITE_API_SECRECT; // Trùng với server
export function generateHeaders() {
  const timestamp = Date.now().toString();
  

  // HMAC SHA256: timestamp + apiKey với key là apiSecret
  const hash = CryptoJS.HmacSHA256(timestamp + apiKey, apiSecret).toString();

  return {
    'x-api-key': hash,
    'x-timestamp': timestamp,
  };
}
