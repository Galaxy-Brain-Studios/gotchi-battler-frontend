import { api, apiText, apiWithCredentials, apiTextWithCredentials, urls } from './api'
import { requireLoginSession } from './accountStore'
import { notifyUpdate } from './useProfileUpdateNotifications'
import { processTeamModel, generateTeamForBattle } from './teamUtils'

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
  async fetchMyFullProfile () {
    try {
      const profile = await apiWithCredentials.get(urls.profileFull())
      return {
        ...profile,
        teams: (profile.teams || []).map(processTeamModel),
        items: (profile.items || []) // TODO process inventory items?
      }
    } catch (e) {
      console.error('fetchMyFullProfile error', e)
      throw new Error(e.json?.error || 'Error fetching my full profile')
    }
  },
  async fetchProfileTeams () {
    try {
      const teams = await apiWithCredentials.get(urls.profileTeams())
      return teams.map(processTeamModel)
    } catch (e) {
      console.error('fetchProfileTeams error', e)
      throw new Error(e.json?.error || 'Error fetching profile teams')
    }
  },
  // TODO don't have this endpoint, currently using full profile endpoint instead
  async fetchProfileInventory () {
    try {
      const inventory = await apiWithCredentials.get(urls.profileInventory())
      return inventory
    } catch (e) {
      console.error('fetchProfileInventory error', e)
      throw new Error(e.json?.error || 'Error fetching profile inventory')
    }
  },
  async fetchProfileInventoryItemCount(itemId) {
    try {
      const result = await apiWithCredentials.get(urls.profileInventoryItemCount(itemId))
      return result
    } catch (e) {
      console.error('fetchProfileInventoryItemCount error', e)
      throw new Error(e.json?.error || 'Error fetching profile inventory item count')
    }
  },

  saveName: requireLoginSession(async function (name) {
    try {
      const profile = await apiWithCredentials.url(urls.updateProfile()).put({ name })
      notifyUpdate(profile)
      return profile;
    } catch (e) {
      console.error('saveName error', e)
      throw new Error(e.json?.error || 'Error saving name')
    }
  }),

  createTeam: requireLoginSession(async function (team) {
    try {
      const savedTeam = await apiWithCredentials.url(urls.createProfileTeam()).post(generateTeamForBattle(team))
      return processTeamModel(savedTeam);
    } catch (e) {
      console.error('createTeam error', e)
      throw new Error(e.json?.error || 'Error creating team')
    }
  }),

  updateTeam: requireLoginSession(async function (team) {
    try {
      const savedTeam = await apiWithCredentials.url(urls.updateProfileTeam(team.id)).put({
        ...generateTeamForBattle(team),
        id: team.id
      })
      return processTeamModel(savedTeam);
    } catch (e) {
      console.error('updateTeam error', e)
      throw new Error(e.json?.error || 'Error updating team')
    }
  }),

  deleteTeam: requireLoginSession(async function (teamId) {
    try {
      await apiTextWithCredentials.url(urls.deleteProfileTeam(teamId)).delete()
    } catch (e) {
      console.error('deleteTeam error', e)
      throw new Error(e.json?.error || 'Error deleting team')
    }
  }),

  deleteImage: requireLoginSession(async function () {
    try {
      const profile = await apiWithCredentials.url(urls.updateProfileImage()).post({ filename: null })
      notifyUpdate(profile)
      return profile;
    } catch (e) {
      console.error('deleteImage error', e)
      throw new Error(e.json?.error || 'Error deleting image')
    }
  }),
  fetchImageUploadUrl: requireLoginSession(async function (filename) {
    try {
      const result = await apiWithCredentials.url(urls.generateImageUploadUrl()).post({ filename })
      return result; // { url, mimeType, filename }
    } catch (e) {
      console.error('fetchImageUploadUrl error', e)
      throw new Error(e.json?.error || 'Error initializing image upload')
    }
  }),
  finishImageUpload: requireLoginSession(async function (filename) {
    try {
      const profile = await apiWithCredentials.url(urls.updateProfileImage()).post({ filename })
      notifyUpdate(profile)
      return profile;
    } catch (e) {
      console.error('finishImageUpload error', e)
      throw new Error(e.json?.error || 'Error finishing image upload')
    }
  }),
  async uploadImage ({ uploadUrl, mimeType, file }) {
    try {
      const headers = {
        'Content-Type': mimeType
      }
      const result = await apiText.url(uploadUrl).headers(headers).put(file)
      return result;
    } catch (e) {
      console.error('uploadImage error', e)
      throw new Error(e.json?.error || 'Error uploading image')
    }
  },
}
