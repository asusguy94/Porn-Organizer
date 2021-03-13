import { isHidden } from '../search/helper'

const LabelCount = ({ obj, isArr = false, label, prop }) => {
	const getPropCount = (prop, label, visibleOnly = false) => {
		const arr = obj.filter(item => item[prop].includes(label) && !(isHidden(item) && visibleOnly))

		return arr.length
	}

	const getArrCount = (prop, label, visibleOnly = false) => {
		const arr = obj.filter(item => item[prop].includes(label) && !(isHidden(item) && visibleOnly))

		return arr.length
	}

	return (
		<>
			({isArr ? getArrCount(prop, label, true) : getPropCount(prop, label, true)}
			<span className='divider'>|</span>
			{isArr ? getArrCount(prop, label) : getPropCount(prop, label)})
		</>
	)
}

export default LabelCount
