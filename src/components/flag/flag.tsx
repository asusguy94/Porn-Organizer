import classes from './flag.module.scss'

interface FlagProps {
	code: string
	spacing?: number
	style?: React.CSSProperties
}
const Flag = ({ code, spacing = 0, style = {} }: FlagProps) => (
	<i
		className={`${classes.flag} ${classes[`flag-${code}`]}`}
		style={spacing > 0 ? { ...style, marginRight: spacing } : style}
	/>
)

export default Flag
