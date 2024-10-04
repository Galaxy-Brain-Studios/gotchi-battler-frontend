import { api, apiWithCredentials, apiTextWithCredentials, urls } from './api'
import { requireLoginSession } from './accountStore'

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
  async fetchProfileInventoryItemCount({ address, itemId }) {
    try {
      const result = await api.get(urls.profileInventoryItemCount({ address, itemId }))
      return result
    } catch (e) {
      console.error('fetchProfileInventoryItemCount error', e)
      throw new Error(e.json?.error || 'Error fetching profile inventory item count')
    }
  },

  saveName: requireLoginSession(async function (name) {
    try {
      const result = await apiWithCredentials.url(urls.saveProfileName()).post({ name })
      return result;
    } catch (e) {
      console.error('saveName error', e)
      throw new Error(e.json?.error || 'Error saving name')
    }
  }),

  deleteTeam: requireLoginSession(async function (teamId) {
    try {
      await apiTextWithCredentials.url(urls.deleteProfileTeam({ teamId })).delete()
    } catch (e) {
      console.error('deleteTeam error', e)
      throw new Error(e.json?.error || 'Error deleting team')
    }
  }),

  deleteImage: requireLoginSession(async function () {
    try {
      const profile = await apiWithCredentials.url(urls.deleteProfileImage()).delete()
      return profile;
    } catch (e) {
      console.error('deleteImage error', e)
      throw new Error(e.json?.error || 'Error deleting image')
    }
  }),
  fetchImageUploadUrl: requireLoginSession(async function (fileName) {
    try {
      const result = await apiWithCredentials.url(urls.generateImageUploadUrl()).post({ fileName })
      return result?.url;
    } catch (e) {
      console.error('fetchImageUploadUrl error', e)
      throw new Error(e.json?.error || 'Error initializing image upload')
    }
  }),
  async uploadImage ({ uploadUrl, file }) {
    try {
      // TODO what does the cloud upload URL expect?
      const headers = {
        'Content-Type': 'application/octet-stream'
      }
      const result = await api.url(uploadUrl).headers(headers).put(file)
      return result;
    } catch (e) {
      console.error('uploadImage error', e)
      throw new Error(e.json?.error || 'Error uploading image')
    }
  },
}
