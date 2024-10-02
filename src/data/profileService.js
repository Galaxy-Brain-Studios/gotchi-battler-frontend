import { api, apiWithCredentials, apiTextWithCredentials, urls } from './api'
import { getSignedSession } from './accountStore'

const requireLoginSession = function (doRequest) {
  return async (...args) => {
    let address
    try {
      const signResult = await getSignedSession()
      address = signResult.address
    } catch (e) {
      console.error('Error signing in', e)
      throw new Error(e.message || 'Error signing in')
    }
    try {
      return await doRequest({ address }, ...args)
    } catch (e) {
      if (e.message === 'Unauthorized') {
        // Retry login once
        try {
          const signResult = await getSignedSession(true)
          address = signResult.address
        } catch (e) {
          console.error('Error signing in (retry)', e)
          throw new Error(e.message || 'Error signing in')
        }
        // Retry the request, allow it to throw errors
        return await doRequest({ address }, ...args)
      } else {
        throw e
      }
    }
  }
}

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

  saveName: requireLoginSession(async function (session, name) {
    try {
      const result = await apiWithCredentials.url(urls.saveProfileName(session.address)).post({ name })
      return result;
    } catch (e) {
      console.error('saveName error', e)
      throw new Error(e.json?.error || 'Error saving name')
    }
  }),

  deleteTeam: requireLoginSession(async function (session, teamId) {
    try {
      await apiTextWithCredentials.url(urls.deleteProfileTeam({ address: session.address, teamId })).delete()
    } catch (e) {
      console.error('deleteTeam error', e)
      throw new Error(e.json?.error || 'Error deleting team')
    }
  }),

  deleteImage: requireLoginSession(async function (session) {
    try {
      const profile = await apiWithCredentials.url(urls.deleteProfileImage(session.address)).delete()
      return profile;
    } catch (e) {
      console.error('deleteImage error', e)
      throw new Error(e.json?.error || 'Error deleting image')
    }
  }),
  fetchImageUploadUrl: requireLoginSession(async function (session, fileName) {
    try {
      const result = await apiWithCredentials.url(urls.generateImageUploadUrl(session.address)).post({ fileName })
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
