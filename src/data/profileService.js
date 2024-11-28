import { api, apiText, apiWithCredentials, apiTextWithCredentials, urls, getResponseErrorMessage } from './api'
import { requireLoginSession } from './accountStore'
import { notifyUpdate } from './useProfileUpdateNotifications'
import { processTeamModel, generateTeamForBattle } from './teamUtils'

const newDefaultProfile = function (address) {
  return {
    address,
    name: null,
    avatar: null
  }
}
export default {
  async fetchProfile (address) {
    try {
      const profile = await api.get(urls.profile(address))
      return profile
    } catch (e) {
      const message = getResponseErrorMessage(e)
      if (message?.includes('User not found')) {
        // user doesn't exist on server, that's ok
        // console.log('Detected User not found', { e })
        return newDefaultProfile(address)
      }
      console.error('fetchProfile error', {e})
      throw new Error(message || 'Error fetching profile')
    }
  },
  fetchProfileTeams: requireLoginSession(async function () {
    try {
      const teams = await apiWithCredentials.get(urls.profileTeams())
      return teams.map(processTeamModel)
    } catch (e) {
      console.error('fetchProfileTeams error', e)
      throw new Error(getResponseErrorMessage(e) || 'Error fetching profile teams')
    }
  }),
  fetchProfileInventory: requireLoginSession(async function () {
    try {
      const inventory = await apiWithCredentials.get(urls.profileInventory())
      return inventory
    } catch (e) {
      console.error('fetchProfileInventory error', e)
      throw new Error(getResponseErrorMessage(e) || 'Error fetching profile inventory')
    }
  }),
  fetchProfileInventoryItemCount: requireLoginSession(async function (itemId) {
    try {
      // We don't have a single item count endpoint, so use the full inventory
      const inventory = await apiWithCredentials.get(urls.profileInventory())
      const item = inventory?.find(item => `${item.id}` === `${itemId}`)
      return {
        quantity: item?.quantity || 0
      }
    } catch (e) {
      console.error('fetchProfileInventoryItemCount error', e)
      throw new Error(getResponseErrorMessage(e) || 'Error fetching profile inventory item count')
    }
  }),
  fetchItemPurchase: requireLoginSession(async function (txId) {
    try {
      const purchase = await apiWithCredentials.get(urls.itemPurchase(txId))
      return purchase
    } catch (e) {
      const message = getResponseErrorMessage(e)
      if (message?.includes('Item purchase not found')) {
        // purchase doesn't exist on server, that's ok, just return null
        // console.log('Detected Item Purchase not found', { e })
        return null
      }
      console.error('fetchItemPurchase error', e)
      throw new Error(message || 'Error fetching item purchase')
    }
  }),

  saveName: requireLoginSession(async function (name) {
    try {
      const profile = await apiWithCredentials.url(urls.updateProfile()).put({ name })
      notifyUpdate(profile)
      return profile;
    } catch (e) {
      console.error('saveName error', e)
      throw new Error(getResponseErrorMessage(e) || 'Error saving name')
    }
  }),

  createTeam: requireLoginSession(async function (team) {
    try {
      const teamForBattle = await generateTeamForBattle(team)
      const savedTeam = await apiWithCredentials.url(urls.createProfileTeam()).post(teamForBattle)
      return processTeamModel(savedTeam);
    } catch (e) {
      console.error('createTeam error', e)
      throw new Error(getResponseErrorMessage(e) || 'Error creating team')
    }
  }),

  updateTeam: requireLoginSession(async function (team) {
    try {
      const teamForBattle = await generateTeamForBattle(team)
      // Do not include the team id in the body
      const savedTeam = await apiWithCredentials.url(urls.updateProfileTeam(team.id)).put(teamForBattle)
      return processTeamModel(savedTeam);
    } catch (e) {
      console.error('updateTeam error', e)
      throw new Error(getResponseErrorMessage(e) || 'Error updating team')
    }
  }),

  deleteTeam: requireLoginSession(async function (teamId) {
    try {
      await apiTextWithCredentials.url(urls.deleteProfileTeam(teamId)).delete()
    } catch (e) {
      console.error('deleteTeam error', e)
      throw new Error(getResponseErrorMessage(e) || 'Error deleting team')
    }
  }),

  fetchTournamentTeamToEdit: requireLoginSession(async function (teamId) {
    try {
      const team = await apiWithCredentials.url(urls.getTournamentTeamToEdit(teamId)).get()
      return processTeamModel(team, { useOnchainIds: true })
    } catch (e) {
      console.error('fetchTournamentTeamToEdit error', e)
      throw new Error(getResponseErrorMessage(e) || 'Error fetching team')
    }
  }),

  deleteImage: requireLoginSession(async function () {
    try {
      const profile = await apiWithCredentials.url(urls.updateProfileImage()).post({ filename: null })
      notifyUpdate(profile)
      return profile;
    } catch (e) {
      console.error('deleteImage error', e)
      throw new Error(getResponseErrorMessage(e) || 'Error deleting image')
    }
  }),
  fetchImageUploadUrl: requireLoginSession(async function (filename) {
    try {
      const result = await apiWithCredentials.url(urls.generateImageUploadUrl()).post({ filename })
      return result; // { url, mimeType, filename }
    } catch (e) {
      console.error('fetchImageUploadUrl error', e)
      throw new Error(getResponseErrorMessage(e) || 'Error initializing image upload')
    }
  }),
  finishImageUpload: requireLoginSession(async function (filename) {
    try {
      const profile = await apiWithCredentials.url(urls.updateProfileImage()).post({ filename })
      notifyUpdate(profile)
      return profile;
    } catch (e) {
      console.error('finishImageUpload error', e)
      throw new Error(getResponseErrorMessage(e) || 'Error finishing image upload')
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
      throw new Error(getResponseErrorMessage(e) || 'Error uploading image')
    }
  },
}
