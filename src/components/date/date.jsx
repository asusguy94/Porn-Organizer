import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'

dayjs.extend(duration)

export const DaysToYears = ({ days }) => <>{Math.floor(dayjs.duration({ days: days }).asYears())}</>
