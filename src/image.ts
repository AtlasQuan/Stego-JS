import { clamp } from './helper';
import { grayscale, clip } from './grayscale';
import { Loc } from './bit';
import { Options, EncodeOptions } from '.';

export function updateImg(
  imageData: ImageData,
  block: Array<number>,
  { p, c }: Loc,
  { size }: Options
) {
  const { width } = imageData;
  const h1 = Math.floor(p / Math.floor(width / size)) * size;
  const w1 = (p % Math.floor(width / size)) * size;

  for (let i = 0; i < block.length; i += 1) {
    const h2 = Math.floor(i / size);
    const w2 = i % size;

    imageData.data[((h1 + h2) * width + w1 + w2) * 4 + c] = clamp(
      Math.round(block[i]),
      0,
      255
    );
  }
}

export function* divideImg(imageData: ImageData, { size }: Options) {
  const { width, height, data } = imageData;

  for (let h = 0; h < height; h += size) {
    for (let w = 0; w < width; w += size) {
      if (h + size <= height && w + size <= width) {
        for (let c = 0; c < 3; c += 1) {
          const block: Array<number> = [];

          for (let h1 = 0; h1 < size; h1 += 1) {
            for (let w1 = 0; w1 < size; w1 += 1) {
              block[h1 * size + w1] = data[((h + h1) * width + w + w1) * 4 + c];
            }
          }
          yield block;
        }
      }
    }
  }
}

export function decolorImg(
  imageData: ImageData,
  { grayscaleAlgorithm }: EncodeOptions
) {
  const { width, height, data } = imageData;
  const length = width * height;

  for (let i = 0; i < length; i += 1) {
    const p = i * 4;
    const g = grayscale(data[p], data[p + 1], data[p + 2], grayscaleAlgorithm);

    data[p] = g;
    data[p + 1] = g;
    data[p + 2] = g;
  }
}

export function clipImg(
  imageData: ImageData,
  { clip: clipSize }: EncodeOptions
) {
  const { width, height, data } = imageData;
  const length = width * height;

  for (let i = 0; i < length; i += 1) {
    const p = i * 4;

    data[p] = clip(data[p], clipSize);
    data[p + 1] = clip(data[p + 1], clipSize);
    data[p + 2] = clip(data[p + 2], clipSize);
  }
}

export function walkImg(
  imageData: ImageData,
  options: Options,
  callback: (block: Array<number>, loc: Loc) => void
) {
  let c = 0;
  let p = 0;
  let b = 0;

  for (const block of divideImg(imageData, options)) {
    callback(block, { c, p, b });
    c += 1;
    b += 1;
    if (c === 3) {
      p += 1;
      c = 0;
    }
  }
}