import { ref } from 'vue'

const tickerDate = ref(new Date())

// This date object is updated every 60 seconds
// So it's not an accurate 'now', but will change frequently enough
// that it can be used as a reactive trigger for relative date displays/calculations
setInterval(() => { tickerDate.value = new Date() }, 60_000)

export default function () {
  return {
    tickerDate
  }
}
