export interface ILayout{
  barPad: number,
	PortDotSize: number,
	portTriLength: number,
	portHeight: number, // ratio of barspacing
	numPortIn: number,
	numPortOut: number,
	numPortReturn: number,
	portTypes: { in: 'In', out: 'out', return: 'return' },
	graphWidth: number,
	graphHeight: number,
	graphPadTop: number,
	graphPadLeft: number,
	graphPadRight: number,
	graphPadBottom: number,
	graphX0:number,
	graphAxisColor: string,
	barSpacing: number,
	portLinkHoffset: number,
	portLinkVoffset: number,
	// highlightArrowRatio sets the hover or selected scale
	highlightSizeRatio: number,
}


export interface Link{
  id:number,
  from:number
  to:number
}

export interface SelActive{
  type:string
  id:number
}

export interface Task{
  id:number
  name:string
  duration:number
}

export interface ITaskDtl{
  id:number| string
  index:number
  name:string
  duration:number
  froms:number[]
	rets:number[]
  tos:number[]
  start:number
	} 

export interface XY {
	x: number 
	y: number 
}

export enum SelTypes{
  'backGraph'='backGraph',
  'TaskBar'='TaskBar',
  'Port'='Port',
}