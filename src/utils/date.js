  import { formatDuration, intervalToDuration, isBefore } from 'date-fns'

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
    const now = new Date()
    const isDateBeforeNow = isBefore(date, now)
    let str = formatDuration(
      intervalToDuration({
        start: isDateBeforeNow ? date : now,
        end: isDateBeforeNow ? now : date
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