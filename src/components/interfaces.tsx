export interface Node {
    name: string,
    type?: string,
    layer?: number,
    x?: number,
    y?: number,
    zlevel?: number,
}
  
export interface Link {
    source: string,
    target: string,
    value: number,
    label?: any,
}