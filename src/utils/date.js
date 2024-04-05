  import { formatDuration, intervalToDuration } from 'date-fns'

  const formatterDateTime = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    timeZoneName: "short"
  })
  const formatDateTime = date => formatterDateTime.format(date)

  const formatterDate = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  })
  const formatDate = date => formatterDate.format(date)

  const formatRelativeDateTime = date => {
    let str = formatDuration(
      intervalToDuration({
        start: date,
        end: new Date()
      })
    )
    // Shorten it further
    if (str.includes(' second')) {
      str = str.replace(/(\d) seconds?/, '$1s')
    }
    if (str.includes(' minute')) {
      str = str.replace(/(\d) minutes?/, '$1 min')
    }
    if (str.includes(' hour')) {
      str = str.replace(/(\d) hours?/, '$1 hr')
    }
    return str
  }

  export {
    formatDateTime,
    formatDate,
    formatRelativeDateTime
  }