import { Options } from '../utils/stego-params'
import { TransformAlgorithm } from '../utils/transform'
import { hashCode, squareCircleIntersect } from '../utils/helper'
import { Locator } from '../utils/locator'

export interface Accumulator {
  /**
   * previous bit position
   */
  prevPos: number
  /**
   * previous hash code
   */
  prevCode: string
  /**
   * available indices
   */
  indices: number[]
}

export function createAcc({ size, transformAlgorithm }: Options) {
  switch (transformAlgorithm) {
    case TransformAlgorithm.FFT1D:
      return {
        prevPos: -1,
        prevCode: '',
        indices: squareCircleIntersect(size, 3),
      }
    default:
      return {
        prevPos: -1,
        prevCode: '',
        indices: [],
      }
  }
}

export function getPosFromAcc(acc: Accumulator, { c }: Locator, { pass }: Options) {
  const { prevCode, prevPos, indices } = acc

  if (c !== 0) {
    return prevPos
  }

  const [index, code] = hashCode(`${pass}_${prevCode}`, indices.length, [])

  acc.prevCode = code
  acc.prevPos = indices[index]
  return indices[index]
}

export function getPos(options: Options): Array<number> {
  const { pass, size, transformAlgorithm } = options

  switch (transformAlgorithm) {
    case TransformAlgorithm.FFT1D:
      return [3 * size + 1, 2 * size + 2]
    case TransformAlgorithm.FFT2D:
      return [3 * size + 1, 2 * size + 2]
    case TransformAlgorithm.DCT:
      return [3 * size + 1, 2 * size + 2]
    case TransformAlgorithm.fastDCT:
      return [3 * size + 1, 2 * size + 2]
    default:
      throw new Error(`unknown algortihm in getPos: ${transformAlgorithm}`)
  }
}
