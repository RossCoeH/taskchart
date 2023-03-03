import { colors } from 'grommet/themes/base'
import { Link, Task, ILayout } from './seqTypes'

export const initialLayout: ILayout = {
	barPad: 7,
	PortDotSize: 0.1,

	numPortIn: 4,
	numPortOut: 4,
	numPortReturn: 3,
	portTypes: { in: 'In', out: 'out', return: 'return' },
	graphWidth: 1020,
	graphHeight: 500,
	graphPadTop: 45,
	graphPadLeft: 10,
	graphPadRight: 20,
	graphPadBottom: 20,
	graphX0: 30,
	graphAxisColor: '#4380cc',
	barSpacing: 40,
	portTriLength: 12, 
	portTriHeight: 7, 
	portLinkHoffset: 9,
	portLinkVoffset: 9,
	retLinkHdropperOffset: 9,
	cColors: {
		active: 'green',
		black: 'black',
		border: 'LightGrey',
		focus: 'DarkOrange',
		placeholder: 'LightGray',
		selected: 'DodgerBlue',
		white: 'white',
	},
	// highlightArrowRatio sets the hover or selected scale
	highlightSizeRatio: 1.5,
}
export const initTasksArray: Task[] = [
	{
		id: 0,
		name: 'name 0',
		duration: 1,
	},
	{
		id: 1,
		name: 'name 1',
		duration: 10,
	},
	{
		id: 2,
		name: 'name 2',
		duration: 20,
	},
	{
		id: 3,
		name: 'name 3',
		duration: 30,
	},
	{
		id: 4,
		name: 'name 4 ',
		duration: 30,
	},
	{
		id: 5,
		name: 'name 5 ',
		duration: 5,
	},
]

export const initLinksArray: Link[] = [
	{ id: 1, from: 1, to: 2 },
	{ id: 2, from: 2, to: 3 },
	{ id: 3, from: 3, to: 4 },
	{ id: 4, from: 1, to: 4 },
	{ id: 5, from: 2, to: 1 },
	{ id: 6, from: 3, to: 1 },
	{ id: 7, from: 4, to: 1 },
	{ id: 8, from: 4, to: 2 },
]
