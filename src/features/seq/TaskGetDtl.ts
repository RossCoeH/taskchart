import {
	ILinkOut,
	ILinkIn,
	ITaskDtl,
	Task,
	Link,
	IloopInfo,
	ILinkFrom,
	ILoopListItem,
	IRetPort,
} from './seqTypes'

type IgetPrevs = {
	targetIndex: number
	minIndex: number
	curTree: number[]
}

const getPrevIndexes = (
	targetIndex: number,
	taskDtlList: ITaskDtl[]
): number[] => {
	if (targetIndex !== undefined)
		return taskDtlList[targetIndex].inLinks.map((tLink) => tLink.fromTaskIndex)
	else return []
}

export default function taskGetDtl(
	taskList: Task[],
	linkList: Link[]
): ITaskDtl[] {
	console.log('LinkList is: ', linkList)
	// creates a detailed version of taskmap for plotting
	// uses same order as task.id // now roll through tasks and add to array
	var maxLoopDuration = 0
	var taskDtlList: ITaskDtl[] = []
	var loopList: ILoopListItem[] = [] //init LoopList and add when a completed loop is found
	// use tasklist forEach so that we can read inprogress list
	taskList.forEach((curTask, curTaskIndex, taskList) => {
		//const ctask = state.tasks.entities[taskId] // use for logging
		// console.log(
		// 	`preparing taskDtl for index ${index} - taskId ${taskid} `,
		// 	ctask
		// )
		//	console.log(`index ${index} - task`, taskid, ctask)
		var fromRets: ILinkFrom[] = []
		var toRets: ILinkIn[] = []
		var retPorts:IRetPort[]=[]
		var outlinks: ILinkIn[] = []
		var fromLinks: ILinkOut[] = []
		var loopList: ILoopListItem[] = []
		let startTime = 0
		let endTime = 0
		// now scan all links once to crete tos,froms,rets

		linkList.forEach((linkItem: Link) => {
			const linkEntToTaskId = linkItem.to
			const linkEntFromTaskId = linkItem.from
			const linkEntFromId = linkItem.from
			const toTaskIndex = taskList.findIndex(
				(task) => task.id === linkEntToTaskId
			)
			const fromTaskIndex = taskList.findIndex(
				(task) => task.id === linkEntFromTaskId
			)
			const curTaskDuration: number = curTask.duration ?? 0
			// get endtime of from task from tasksDtl (or 0)
			const fromTaskEndTime: number = taskDtlList[fromTaskIndex]?.endTime ?? 0

			if (linkEntToTaskId === curTask.id && fromTaskIndex < toTaskIndex) {
				fromLinks.push({
					fromTaskId: linkEntToTaskId,
					fromTaskIndex: fromTaskIndex,
					id: linkItem.id,
				})
				startTime = Math.max(startTime, fromTaskEndTime) //update starttime
				endTime = startTime + curTaskDuration //update endtime
				console.log(
					'from link added to task index',
					toTaskIndex,
					' link',
					linkItem,
					' startTime',
					startTime
				)
			}

			if (linkEntToTaskId === curTask.id && toTaskIndex < fromTaskIndex) {
				// push link without loop analysis - so has a empty seq array
				{
					fromRets.push({
						fromTaskId: linkEntFromId,
						fromTaskIndex: fromTaskIndex,
						id: linkItem.id,
						seqLoops: [],
						loopDuration: undefined,
					})
					retPorts.push({
						isStart:false,
						id: linkItem.id,
						otherTaskIndex: fromTaskIndex,
					})
					console.log(
						`RetTask index to ${curTaskIndex}: return loop End added: link id ${linkItem.id} from index ${fromTaskIndex}`
					)
				}
			}
	
			if (linkEntFromTaskId === curTask.id && toTaskIndex < fromTaskIndex) {
				toRets.push({
					toTaskId: linkEntFromId,
					toTaskIndex: toTaskIndex,
					id: linkItem.id,
				})
					retPorts.push({
						isStart:true,
						id: linkItem.id,
					  otherTaskIndex: toTaskIndex,
					})
					console.log(
						`RetTask index from ${fromTaskIndex}: return loop Start added To task index ${toTaskIndex} link id ${linkItem.id} to index ${toTaskIndex}`
					)
			}

			// now collect tos and update start time if needed (as any predecessors will already exist and be at a lower index):

			if (
				linkEntFromTaskId === curTask.id &&
				toTaskIndex > curTaskIndex &&
				fromTaskIndex !== -1
			) {
				outlinks.push({
					toTaskId: linkEntToTaskId,
					toTaskIndex: toTaskIndex,
					id: linkItem.id,
				})
				// console.log('to Link added to task index',toTaskIndex,' link',linkItem)
			}

			// map of tos,rets, froms is complete so sort within each task based on index
			fromLinks.sort((aTask, bTask) =>
				aTask.fromTaskIndex < bTask.fromTaskIndex ? 1.0 : -1.0
			)
			fromRets.sort((aTask, bTask) =>
				aTask.fromTaskIndex < bTask.fromTaskIndex ? 1.0 : -1.0
			)
			toRets.sort((aTask, bTask) =>
				aTask.toTaskIndex < bTask.toTaskIndex ? 1.0 : -1.0
			)
			outlinks.sort((aTask, bTask) =>

				aTask.toTaskIndex - bTask.toTaskIndex ? 1.0 : -1.0
			)
			retPorts.sort((aPort,bPort)=>  (!aPort.isStart ||  aPort.otherTaskIndex < bPort.otherTaskIndex?1.0:-1.0))
		})
		// now push into taskDetail without loop analysis
		var newTask: ITaskDtl = {
			id: curTask.id,
			index: curTaskIndex,
			name: curTask.name,
			duration: curTask.duration,
			inLinks: fromLinks,
			outLinks: outlinks,
			retFroms: fromRets,
			retTos: toRets,
			retPorts:retPorts,
			startTime: startTime,
			endTime: startTime + curTask.duration,
			cycleTime: undefined,
			floatTime: undefined,
		}

		console.log('taskDtl added taskDtl line ', curTaskIndex, newTask)
		taskDtlList.push(newTask)
	})
	// start return links - done after taskDtl complete is added so we can access current task
	const tasksWithRets = taskDtlList.filter((tlink) => tlink.retFroms.length > 0)

	tasksWithRets.forEach((tretdtl) => {
		var searchTaskItems: IloopInfo[] = []
		tretdtl.retFroms.forEach((tretLink, indextret) => {
			const retToTaskIndex = tretdtl.index
			const retFromTaskIndex = tretLink.fromTaskIndex
			//find the predecessor items and check if the link loop is complete
			// go backwards and push sequence into arrays until endpoint is found or retloop index is passed.
			searchTaskItems.push({
				startIndex: retToTaskIndex,
				endIndex: retFromTaskIndex,
				seqStack: [retFromTaskIndex],
				cycleLoopTime: undefined,
			})
			//stacklist of possibles starting with current task
			var foundLoopSeq: IloopInfo[] = []
			while (searchTaskItems.length > 0) {
				// iterate search - op returns undefined if array is empty
				const searchTask = searchTaskItems.pop()

				if (searchTask !== undefined) {
					// already skipped if nothing provided
					var searchItemIndex: number = searchTask?.seqStack[0]
					var gprevs = getPrevIndexes(searchItemIndex, taskDtlList)
					gprevs.forEach((prevItemIndex) => {
						// we are working back frrom end, so push new item into front of array which is also easier to retrieve
						const curSeq = [prevItemIndex, ...searchTask.seqStack]
						//	we have reached start	of defined loop so push into foundloopsSeq
						if (prevItemIndex === retToTaskIndex) {
							// get cycle time
							const cycleLoopTime: number =
								taskDtlList[retFromTaskIndex].endTime -
								taskDtlList[retToTaskIndex].startTime

							// now update task cycleTime and float
							curSeq.forEach((itemTaskIndex) => {
								const cTask = taskDtlList[itemTaskIndex]
								cTask.cycleTime = cTask.cycleTime
									? Math.max(cTask.cycleTime, cycleLoopTime)
									: cycleLoopTime
								const pathDurations = curSeq.map(
									(item) => taskDtlList[item].duration
								)
								console.log('path durations', pathDurations)
								const minDuration = pathDurations.reduce(
									(accumTime = 0, item) => accumTime + item
								)

								cTask.floatTime = cTask.floatTime
									? Math.min(cTask.floatTime, cycleLoopTime - minDuration)
									: cycleLoopTime - minDuration
								console.log(
									'loopTime',
									cTask.cycleTime,
									'float',
									cTask.floatTime
								)
							})

							loopList.push({ seqStack: curSeq, loopDuration: cycleLoopTime })
							foundLoopSeq.push({
								startIndex: retToTaskIndex,
								endIndex: retFromTaskIndex,
								seqStack: curSeq,
								cycleLoopTime: cycleLoopTime,
							})

							console.log(
								'completed loop found for indexes: ',
								curSeq,
								'duration',
								cycleLoopTime
							)
						}
						if (prevItemIndex >= 0 && prevItemIndex > retToTaskIndex) {
							// have not gone past bottom of list and so add back to search list
						}
						searchTaskItems.push({
							startIndex: retToTaskIndex,
							endIndex: retFromTaskIndex,
							seqStack: curSeq,
							cycleLoopTime: undefined,
						})
						/* 	console.log(
							'partial search loop to index: ',
							retToTaskIndex,
							'partial seq is: ',
							curSeq
						) */
					})
				}
			}
			/* 
			console.log(
				'loop seqs',
				foundLoopSeq.map((item) => item.seqStack)
			) */
			//update taskdetail
			const currentRetLoop = taskDtlList[tretdtl.index].retFroms[indextret]
			currentRetLoop.seqLoops = foundLoopSeq.map((item) => item.seqStack)
			return foundLoopSeq
		})
	})

	// fromLinks.forEach(fTaskItem => {
	// 	searchTaskItems.push({startIndex:toTaskIndex,endIndex:curTaskIndex,seqStack:[fTaskItem.fromTaskIndex,curTaskIndex ]})

	//prevTasksIndexes:
	//now check that the time float for the return loop
	const looptimes = loopList.map((item) => item.loopDuration)
	maxLoopDuration = Math.max(...looptimes)
	taskDtlList.forEach((item) => {
		//only update cycletime if item is part of at least one loop
		if (item.cycleTime != undefined) {
			item.floatTime = maxLoopDuration - item.duration
		}
	})
	console.log('TaskDtlList before export ', taskDtlList)
	return taskDtlList
}
