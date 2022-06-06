export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randomHexColor(): string {
  return `#${randomInt(0, 0xffffff).toString(16).padStart(6, '0')}`
}
