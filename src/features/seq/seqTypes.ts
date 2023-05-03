import { EntityId } from '@reduxjs/toolkit'
import { CSSProperties } from 'react'
import { ScaleLinear } from 'd3-scale'
import { ProvidedZoom } from '@visx/zoom/lib/types'
export type ColorType = CSSProperties['color']
export interface ILayout {
	barPad: number
	PortDotSize: number
	portTriLength: number
	portTriHeight: number // ratio of barspacing
	numPortIn: number
	numPortOut: number
	numPortReturn: number
	portTypes: { in: 'In'; out: 'out'; return: 'return' }
	graphWidth: number
	graphHeight: number
	graphPadTop: number
	graphPadLeft: number
	graphPadRight: number
	graphPadBottom: number
	graphxFontOffset: number
	graphAxisColor: string
	barSpacing: number
	portLinkHoffset: number
	portLinkVoffset: number
	retLinkHdropperOffset: number
	// highlightArrowRatio sets the hover or selected scale
	highlightSizeRatio: number
	cColors: {
		active: ColorType
		black: ColorType
		border?: ColorType
		brand?: ColorType
		control?: ColorType
		focus: ColorType
		placeholder?: ColorType
		selected: ColorType
		text?: ColorType
		icon?: ColorType
		white: ColorType
	}
}

export enum dragAction {
	'none',
	'dragLine',
	'canCreateLink',
	'pan',
}

export const enum e_SeqDiagElement {
	TaskBar = 'TaskBar',
	SeqChart = 'SeqChart',
	Link = 'Link',
	'LinkStart' = 'LinkStart',
	LinkEnd = 'LinkEnd',
	Port = 'Port',
	PortIn = 'Portin',
	PortOut = 'PortOut',
}

export interface Link {
	id: number | string
	from: number | string
	to: number | string
}

export interface IBranchLink {
	id: number | string
	froms?: EntityId[]
	tos?: EntityId[]
	links: EntityId[]
	IsRoot: boolean
	hasValidReturn: boolean
}

	export type IDragStartItem = {
		x: number
		y: number
	selInfo: ISelInfo
	}

export interface ISelInfo {
	type: e_SeqDiagElement
	id: EntityId | undefined
	sname?: string
	desc?: string
}



export interface Task {
	id: number | string
	name: string
	duration: number
}

export type TaskNoId = Omit<Task, 'id'>

export type ILinkOut = {
	fromTaskId: EntityId
	fromTaskIndex: number
	id: number | string
}
export type ILinkIn = {
	toTaskId: EntityId
	toTaskIndex: number
	id: number | string
}
export type ILinkFrom = {
	fromTaskId: EntityId
	fromTaskIndex: number
	id: number | string
	seqLoops: number[][]
	loopDuration: number | undefined
}
export type IRetPort = {
	isStart: boolean
	id: number | string
	otherTaskIndex: number
}
export interface ITaskDtl {
	id: number | string
	index: number
	name: string
	duration: number
	inLinks: ILinkOut[]
	retFroms: ILinkFrom[]
	retTos: ILinkIn[]
	retPorts: IRetPort[]
	outLinks: ILinkIn[]
	startTime: number
	endTime: number
	isRoot?: boolean
	cycleTime: number | undefined
	floatTime: number | undefined
}


export interface ILoopListItem {
	seqStack: number[]
	loopDuration: number
}

export interface XY {
	x: number
	y: number
}

export interface IArrayOrderMove {
	fromRowIndex: number
	toRowIndex: number
}

export interface IloopInfo {
	startIndex: number
	endIndex: number
	seqStack: number[]
	cycleLoopTime: number | undefined
}

export interface ISeqStartMouseDrag {
	// startElement: e_SeqDiagElement
	// startId: EntityId
	selInfo:ISelInfo
	//index?: number
	x?: number
	y?: number
}

export interface ISeqEndMouseDrag {
	selInfo: ISelInfo
	allowed: boolean
	// endId: EntityId
	index?: number
	x?: number
	y?: number
}

export interface IHandleSeqMouseDown {
	e: React.MouseEvent<Element>,
	selInfo?:ISelInfo,
	index?:number
	x?:number,
	y?: number,
	zoom?:ProvidedZoom<SVGElement>,
}

// export interface IHandleSeqMouseUp {
// 	e: React.MouseEvent<Element, MouseEvent>,
// 	selInfo: ISelInfo,
	

// }

export interface IHandleSeqMouseMovewithInfo{
	e: React.MouseEvent, 
	selInfo:ISelInfo,
	 index: number,
	 zoom?:ProvidedZoom<SVGElement>,
}

//export type NumberScale = import("d3-scale").ScaleLinear<number, number, never>

export interface ISeqInfo{
	xScale: ScaleLinear<number,number,never>
	iLayout: ILayout
	dragStartInfo: ISeqStartMouseDrag | undefined
	handleMouseEnter:({e,selInfo}:IMouseOverInfo)=>void
	handleMouseLeave:	({e,selInfo}:IMouseOverInfo)=>void				
	handleMouseDown: ({
		e,
		selInfo,
		index,
		x,
		y,
		zoom,
	}: IHandleSeqMouseDown)  => void
	handleMouseUp: 	({e,selInfo,zoom}:IMouseOverInfo)=>void	
	handleMouseMove:	({e,selInfo,zoom}:IMouseOverInfo)=>void	

}

export interface IMouseOverInfo{
e: React.MouseEvent<Element>,
	selInfo: ISelInfo,
	zoom?:ProvidedZoom<SVGElement>
}

export interface IDrawTasks  extends ISeqInfo{
	taskDtl: ITaskDtl[],
	zoom?:ProvidedZoom<SVGElement>
	} 