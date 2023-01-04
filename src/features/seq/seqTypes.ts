import { EntityId, TaskAbortError } from "@reduxjs/toolkit"
import { type } from "os"
import { CSSProperties } from "react";

export type ColorType= CSSProperties["color"]

export interface ILayout{
  barPad: number,
	PortDotSize: number,
	portTriLength: number,
	portTriHeight: number, // ratio of barspacing
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
	cColors:{
  active: ColorType
  black: ColorType;
  border?: ColorType;
  brand?: ColorType;
  control?: ColorType;
  focus: ColorType;
  placeholder?: ColorType;
  selected: ColorType;
  text?: ColorType;
  icon?: ColorType;
  white: ColorType;
},
	}

export enum dragAction{'none','dragLine','canCreateLink','pan'}

export const enum e_SeqDiagElement{TaskBar='TaskBar',SeqChart='SeqChart',Link='Link','LinkStart'='LinkStart',LinkEnd='LinkEnd',Port='Port',PortIn='Portin',PortOut='PortOut' } 


export interface Link{
  id:number|string,
  from:number|string,
  to:number|string,
}

export interface ISelDiagItem{
  type?:string
  sname?:string
	id?:EntityId
	desc?:string
}

export interface Task{
  id:number|string
  name:string
  duration:number
}

export type TaskNoId = Omit<Task,"id">

export interface ITaskDtl{
  id:number| string
  index:number
  name:string
  duration:number
  froms:Link[]
	rets:Link[]
  tos:Link[]
  start:number
	} 

export interface XY {
	x: number 
	y: number 
}

export interface IArrayOrderMove{
	fromRowIndex:number,
	toRowIndex:number
}
