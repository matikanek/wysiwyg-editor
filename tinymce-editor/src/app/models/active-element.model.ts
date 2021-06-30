export interface ActiveElement {
  isImage?: boolean,
  font: string,
  size: string,
  weight: string,
  color: string,
  coords: Coords,
  width: number,
  height: number
}

export interface Coords {
  x: number,
  y: number
}