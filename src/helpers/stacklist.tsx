// program to implement stack data structure
// from https://dev.to/macmacky/implement-a-stack-with-typescript-4e09
export interface IstackNode<T> {
  value: T | null
  next: IstackNode<T> | null
}

export class IstackNode<T> implements IstackNode<T> {
  constructor(val: T) {
    this.value = val
    this.next = null
  }
}

export interface IstackList<T> {
  size: number
  top: IstackNode<T> | null
  bottom: IstackNode<T> | null
  push(val: T): number
  pop(): IstackNode<T> | null
}



class stackList<T> implements IstackList<T> {
  size: number = 0
  top:IstackNode<T> | null = null
  bottom:IstackNode<T> | null=null
  
  constructor() {
    this.size = 0
    this.top = null
    this.bottom = null
  }

  push(val: T) {
    const node = new IstackNode(val)
    if (this.size === 0) {
      this.top = node
      this.bottom = node
    } else {
      const currentTop = this.top
      this.top = node
      this.top.next = currentTop
    }

    this.size += 1
    return this.size
  }


  pop(): IstackNode<T> | null {
    if (this.size > 0) {
      const nodeToBeRemove = this.top as IstackNode<T>
      this.top = nodeToBeRemove.next
      this.size -= 1
      nodeToBeRemove.next = null
      return nodeToBeRemove
    }
    return null
  }
}

export default stackList

