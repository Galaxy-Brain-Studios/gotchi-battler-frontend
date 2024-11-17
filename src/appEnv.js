const DEV_MODE = import.meta.env.VITE_ENABLE_DEV === 'true'
const API_URL = import.meta.env.VITE_API_URL
const SHOP_CONTRACT_ADDRESS = import.meta.env.VITE_SHOP_CONTRACT_ADDRESS

export {
  DEV_MODE,
  API_URL,
  SHOP_CONTRACT_ADDRESS
}
