import { DEV_MODE } from '../appEnv'

const config = DEV_MODE ? { enable: true } : {}

if (DEV_MODE) {
  window.mockContractConfig = config
}

export default config
