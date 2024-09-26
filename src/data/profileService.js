import { api, urls } from './api'
import { getSignedSession } from './accountStore'

export default {
  async fetchProfile (address) {
    try {
      const profile = await api.get(urls.profile(address))
      return profile
    } catch (e) {
      console.error('fetchProfile error', e)
      throw new Error(e.json?.error || 'Error fetching profile')
    }
  },
  async fetchProfileTeams (address) {
    try {
      const teams = await api.get(urls.profileTeams(address))
      return teams
    } catch (e) {
      console.error('fetchProfileTeams error', e)
      throw new Error(e.json?.error || 'Error fetching profile teams')
    }
  },
  async fetchProfileInventory (address) {
    try {
      const inventory = await api.get(urls.profileInventory(address))
      return inventory.map(item => ({
        ...item,
        nameSortable: item.nameSortable || item.name
      }))
    } catch (e) {
      console.error('fetchProfileInventory error', e)
      throw new Error(e.json?.error || 'Error fetching profile inventory')
    }
  },

  async saveName (name) {
    let address, signedSession
    try {
      const result = await getSignedSession()
      address = result.address
      signedSession = result.signedSession
    } catch (e) {
      console.error('saveName error signing in', e)
      throw new Error(e.message || 'Error signing in')
    }
    try {
      // TODO how to communicate signedSession to server
      const result = await api.url(urls.saveProfileName(address)).post({ name, signedSession })
      return result;
    } catch (e) {
      console.error('saveName error', e)
      throw new Error(e.json?.error || 'Error saving name')
    }
  },
}
