<script setup>
  import { ref, computed, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import useProfile from '@/data/useProfile'
  import profileService from '@/data/profileService'
  import useStatus from '../../utils/useStatus'
  import useTournamentPrizeSets from '@/data/useTournamentPrizeSets'
  import SiteRequireSignIn from '../site/SiteRequireSignIn.vue'
  import SiteTextField from '../common/SiteTextField.vue'
  import SiteSelect from '../common/SiteSelect.vue'
  import SiteCheckbox from '../common/SiteCheckbox.vue'
  import SiteButtonPrimary from '../common/SiteButtonPrimary.vue'
  import SiteError from '../common/SiteError.vue'

  const props = defineProps({
    address: {
      type: String,
      required: true
    }
  })  

  const router = useRouter()

  const { isConnectedProfile } = useProfile(props.address)
  const { prizeSets, fetchPrizeSetsStatus } = useTournamentPrizeSets()

  watch(
    () => isConnectedProfile.value,
    () => {
      if (!isConnectedProfile.value) {
        // Cannot manage other people's tournaments, redirect to their profile home
        router.push({ name: 'profile-address', params: { address: props.address } })
      }
    },
    { immediate: true }
  )

  const ITEM_LEVELS = ['none', 'common', 'uncommon', 'rare', 'legendary', 'mythical', 'godlike']
  const PRIZE_CURRENCIES = ['ghst', 'dai']

  const HOUR_OPTIONS = []
  for (let i = 0; i <= 23; i++) {
    HOUR_OPTIONS.push({
      id: '' + i,
      label: (i < 10 ? '0' : '') + i + ':00'
    })
  }

  const form = ref({
    name: '',
    description: '',
    registrationDate: '',
    registrationHour: HOUR_OPTIONS[0].id,
    startDate: '',
    startHour: HOUR_OPTIONS[0].id,
    image: '',
    isDoubleElim: false,
    roundDuration: '1',
    maxItemLevel: ITEM_LEVELS[0],
    maxTeamBrs: '',
    maxGotchiBrs: '',
    tournamentPrizeSetId: '',
    prizeCurrency: PRIZE_CURRENCIES[0]
  })

  const prizeSetAllOptions = computed(() => {
    let sets = []
    if (fetchPrizeSetsStatus.value.loaded && prizeSets.value) {
      sets = prizeSets.value
    }
    return [
      { id: '', label: 'None' },
      ...sets.map(set => ({
        id: '' + set.id, // convert number to string for the HTML option
        label: set.name,
        isDoubleElim: !!set.isDoubleElim
      }))
    ]
  })

  const prizeSetOptions = computed(() => {
    const isDoubleElim = !!form.value.isDoubleElim
    return prizeSetAllOptions.value.filter(option => !option.id || option.isDoubleElim === isDoubleElim)
  })

  watch(
    () => form.value.isDoubleElim,
    () => form.value.tournamentPrizeSetId = ''
  )

  const formToSubmit = computed(() => {
    const formData = form.value
    const tournamentPrizeSetId = formData.tournamentPrizeSetId ? formData.tournamentPrizeSetId - 0 : null
    return {
      name: formData.name,
      description: formData.description,
      registrationDate: formData.registrationDate,
      registrationHour: formData.registrationHour - 0,
      startDate: formData.startDate,
      startHour: formData.startHour - 0,
      image: formData.image,
      isDoubleElim: formData.isDoubleElim,
      roundDuration: parseInt(formData.roundDuration),
      maxItemLevel: formData.maxItemLevel,
      maxTeamBrs: formData.maxTeamBrs ? parseInt(formData.maxTeamBrs) : null,
      maxGotchiBrs : formData.maxGotchiBrs ? parseInt(formData.maxGotchiBrs) : null,
      tournamentPrizeSetId,
      prizeCurrency: tournamentPrizeSetId ? (formData.prizeCurrency || null) : null
    }
  })

  const formValidationErrors = computed(() => {
    const errors = []
    const data = formToSubmit.value
    if (!data.name) {
      errors.push('Please provide a name')
    }
    if (!data.image) {
      errors.push('Please provide an image URL')
    }
    if (isNaN(data.roundDuration) || data.roundDuration <= 0) {
      errors.push('Please provide a round duration that is an integer number of hours')
    }
    if (!data.registrationDate) {
      errors.push('Please provide a registration date')
    } else if (!data.registrationDate.match(/^\d\d\d\d-\d\d-\d\d$/)) {
      errors.push('Please provide a registration date in the format YYYY-MM-DD')
    }
    if (isNaN(data.registrationHour) || (data.registrationHour < 0 || data.registrationHour > 23)) {
      errors.push('Please provide a registration hour')
    }
    if (!data.startDate) {
      errors.push('Please provide a start date')
    } else if (!data.startDate.match(/^\d\d\d\d-\d\d-\d\d$/)) {
      errors.push('Please provide a start date in the format YYYY-MM-DD')
    }
    if (isNaN(data.startHour) || (data.startHour < 0 || data.startHour > 23)) {
      errors.push('Please provide a start hour')
    }

    // optional values, but check them if they're present
    if (data.maxTeamBrs !== null) {
      if (isNaN(data.maxTeamBrs) || data.maxTeamBrs <= 0) {
        errors.push('Please provide max team BRS as an integer number')
      }
    }
    if (data.maxGotchiBrs !== null) {
      if (isNaN(data.maxGotchiBrs) || data.maxGotchiBrs <= 0) {
        errors.push('Please provide max gotchi BRS as an integer number')
      }
    }

    return errors
  })

  const showFormValidationErrors = ref(false)
  const { status: createStatus, setLoading } = useStatus()

  const submitForm = async function () {
    if (formValidationErrors.value?.length) {
      showFormValidationErrors.value = true
      return
    }
    const [isStale, setLoaded, setError] = setLoading()
    try {
      const id = await profileService.createTournament(formToSubmit.value)
      if (isStale()) { return; }
      setLoaded()
      router.push({ name: 'tournament', params: { id } })
    } catch (e) {
      setError(e.message)
    }
  }
</script>

<template>
  <SiteRequireSignIn v-if="isConnectedProfile">
    <template #signin-message>
      to create a tournament
    </template>

    <div>
      <h1>Create a Tournament</h1>

      <div class="tournament-create-form">

        <div>
          <label>
            Name: <SiteTextField v-model="form.name" />
          </label>
        </div>
        <div>
          <label>
            Description:
              <textarea
                v-model="form.description"
                rows="4"
              ></textarea>
          </label>
        </div>
        <div class="tournament-create-form__datetime">
          <div>
            <label>
              Registration Date:
              <SiteTextField
                v-model="form.registrationDate"
                placeholder="YYYY-MM-DD"
                class="tournament-create-form__date-input"
              />
            </label>
          </div>
          <div>
            <label>
              Registration Hour:
                <SiteSelect
                  v-model="form.registrationHour"
                  withBorder
                >
                  <option
                    v-for="option in HOUR_OPTIONS"
                    :key="option.id"
                    :value="option.id"
                  >
                    {{ option.label }}
                  </option>
                </SiteSelect>
            </label>
          </div>
        </div>
        <div class="tournament-create-form__datetime">
          <div>
            <label>
              Start Date:
              <SiteTextField
                v-model="form.startDate"
                placeholder="YYYY-MM-DD"
                class="tournament-create-form__date-input"
              />
            </label>
          </div>
          <div>
            <label>
              Start Hour:
                <SiteSelect
                  v-model="form.startHour"
                  withBorder
                >
                  <option
                    v-for="option in HOUR_OPTIONS"
                    :key="option.id"
                    :value="option.id"
                  >
                    {{ option.label }}
                  </option>
                </SiteSelect>
            </label>
          </div>
        </div>
        <div>
          <label>
            Image URL:
            <SiteTextField v-model="form.image" />
          </label>
        </div>

        <div>
          <SiteCheckbox
            v-model="form.isDoubleElim"
          >
            Use Double-Elimination
          </SiteCheckbox>
        </div>
        <div>
          <label>
            Round Duration (hours): <SiteTextField v-model="form.roundDuration" />
          </label>
        </div>
        <div>
          <label>
            Max Item Level
              <SiteSelect
                v-model="form.maxItemLevel"
                withBorder
              >
                <option
                  v-for="level in ITEM_LEVELS"
                  :key="level"
                  :value="level"
                >
                  {{ level }}
                </option>
              </SiteSelect>
          </label>
        </div>
        <div>
          <label>
            Max Team BRS: <SiteTextField v-model="form.maxTeamBrs" />
          </label>
        </div>
        <div>
          <label>
            Max Gotchi BRS: <SiteTextField v-model="form.maxGotchiBrs" />
          </label>
        </div>

        <div>
          <label>
            Prize Set
              <SiteSelect
                v-model="form.tournamentPrizeSetId"
                withBorder
              >
                <option
                  v-for="set in prizeSetOptions"
                  :key="set.id"
                  :value="set.id"
                >
                  {{ set.label }}
                </option>
              </SiteSelect>
          </label>
          <SiteError
            v-if="fetchPrizeSetsStatus.error"
            small
            style="margin-top: 1rem"
          >
            Error fetching available prize sets: {{ fetchPrizeSetsStatus.errorMessage }}
          </SiteError>
        </div>

        <div v-show="form.tournamentPrizeSetId">
          <label>
            Prize Currency
              <SiteSelect
                v-model="form.prizeCurrency"
                withBorder
              >
                <option
                  v-for="currency in PRIZE_CURRENCIES"
                  :key="currency"
                  :value="currency"
                >
                  {{ currency }}
                </option>
              </SiteSelect>
          </label>
        </div>

        <div
          v-if="showFormValidationErrors && formValidationErrors.length"
          class="tournament-create-form__errors"
        >
          <SiteError
            v-for="error in formValidationErrors"
            :key="error"
            small
          >
            {{ error }}
          </SiteError>
        </div>

        <div v-if="createStatus.error">
          <SiteError small>
            {{ createStatus.errorMessage }}
          </SiteError>
        </div>

        <div class="tournament-create-form__submit">
          <SiteButtonPrimary
            :disabled="createStatus.loading"
            @click="submitForm"
          >
            <template v-if="createStatus.loading">
              Saving...
            </template>
            <template v-else>
              Create Tournament
            </template>
          </SiteButtonPrimary>
        </div>
      </div>
    </div>
  </SiteRequireSignIn>
</template>

<style scoped>
  .tournament-create-form {
    display: flex;
    flex-direction: column;
    row-gap: 1rem;
  }
  .tournament-create-form label {
    display: flex;
    flex-direction: row;
    column-gap: 1rem;
    line-height: 2.5rem;
  }

  .tournament-create-form textarea {
    width: 100%;
    max-width: 40rem;
  }

  .tournament-create-form__datetime {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    column-gap: 2rem;
  }
  .tournament-create-form__datetime > * {
    flex: none;
  }
  .tournament-create-form__date-input {
    width: 15rem;
  }
  .tournament-create-form__errors {
    display: flex;
    flex-direction: column;
    row-gap: 1rem;
  }
  .tournament-create-form__submit {
    margin: 2rem 0;
    display: grid;
    place-content: center;
  }
</style>