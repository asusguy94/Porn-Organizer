import { isHidden } from '@components/search/helper'

interface ILabelCount {
	obj: any
	isArr?: boolean
	label: string
	prop: string
}
const LabelCount = ({ obj, isArr = false, label, prop }: ILabelCount) => {
	const getPropCount = (prop: string, label: string, visibleOnly = false) => {
		const arr = obj.filter((item: any) => item[prop].includes(label) && !(isHidden(item) && visibleOnly))

		return arr.length
	}

	const getArrCount = (prop: string, label: string, visibleOnly = false) => {
		const arr = obj.filter((item: any) => item[prop].includes(label) && !(isHidden(item) && visibleOnly))

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
