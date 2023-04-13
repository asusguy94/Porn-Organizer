import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'

dayjs.extend(duration)

export const daysToYears = (days: number) => Math.floor(dayjs.duration({ days: days }).asYears())
