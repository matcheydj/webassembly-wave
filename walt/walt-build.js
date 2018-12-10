#!/usr/bin/node
const fs = require('fs');
const walt = require('walt-compiler');

const source = `
// WAVE EQUATION - Click and drag on the canvas.
// Hold down a key to animate with the JavaScript version.
// Compare this to the version generated by Emscripten: https://webassembly.studio/?f=kv3dhnahf1

export const memory: Memory<{initial: 1}>;

const ALPHA: i32 = 0xFF000000;
const STATUS_DEFAULT: i32 = 0;
const STATUS_WALL: i32 = 1;
const STATUS_POS_TRANSMITTER: i32 = 2;
const STATUS_NEG_TRANSMITTER: i32 = 3;
const FORCE_DAMPING_BIT_SHIFT: i32 = 4;


function applyCap(x: i32) : i32 {
  if (x < -0x40000000) {
    return -0x40000000;
  }
  if (x > 0x3FFFFFFF) {
    return 0x3FFFFFFF;
  }
  return x;
}

function toRGB(x: i32) : i32 {
  let val: i32 = x >> 22;
  let rgba: i32 = ALPHA;
  if (val > 0) {
    rgba = val | (val << 8) | (val << 16) | ALPHA; // gray
  } else if (val < 0) {
    val = -(val + 1);
    rgba = ((val << 8) | ALPHA); // green
  }
  return rgba;
}

let heapStart: i32 = 0;
let width: i32 = 0;
let height: i32 = 0;
let wh: i32 = 0;

export function init(ignored: i32, offset: i32, w: i32, h: i32): void {
  heapStart = offset;
  width = w;
  height = h;
  wh = width * height;
  const status: i32[] = heapStart + 8 * wh;
  let i: i32 = 0;
  for (i = 0; i < height; i += 1) {
    status[i * width] = STATUS_WALL;
    status[i * width + width - 1] = STATUS_WALL;
  }
  for (i = 0; i < width; i += 1) {
    status[i] = STATUS_WALL;
    status[width * height - width + i] = STATUS_WALL;
  }
}

export function singleFrame(): void {

  const image: i32[] = heapStart;
  const force: i32[] = heapStart + 4 * wh;
  const status: i32[] = heapStart + 8 * wh;
  const u: i32[] = heapStart + 12 * wh;
  const vel: i32[] = heapStart + 16 * wh;

  // Draw walls
  let i: i32 = 0;
  for (i = 0; i < height; i += 1) {
    status[i * width] = 1;
    status[i * width + width - 1] = 1;
  }
  for (i = 0; i < width; i += 1) {
    status[i] = 1;
    status[width * height - width + i] = 1;
  }

  // Calculate velocity change
  for (i = 0; i < wh; i += 1) {
    if (status[i] == 0) {
      const uCen: i32 = u[i];
      const uNorth: i32 = u[i - width];
      const uSouth: i32 = u[i + width];
      const uEast: i32 = u[i + 1];
      const uWest: i32 = u[i - 1];
      const uxx: i32 = (((uWest + uEast) >> 1) - uCen);
      const uyy: i32 = (((uNorth + uSouth) >> 1) - uCen);
      vel[i] = applyCap(vel[i] + (uxx >> 1) + (uyy >> 1));
    }
  }

  // Apply forces
  for (i = 0; i < wh; i += 1) {
    if (status[i] == 0) {
      const f: i32 = force[i];
      u[i] = applyCap(f + applyCap(u[i] + vel[i]));
      force[i] = f >> 1;
    }
  }

  // Generate image
  for (i = 0; i < wh; i += 1) {
    if (status[i] == 1) {
      image[i] = 0x00000000;
    } else {
      image[i] = toRGB(u[i]);
    }
  }
}
  `;

async function build(wasmFilename) {
  if (fs.existsSync(wasmFilename)) {
    fs.unlinkSync(wasmFilename);
  }
  try {
    const compilation = await walt.compile(source);
    const buffer = compilation.buffer();
    fs.writeFileSync(wasmFilename, new Uint8Array(buffer));
    console.log('done.');
  } catch(e) {
    console.log(e);
  }
}

build('./waves.wasm');
/*
const wasmFilename = './waves.wasm';

try {
  if (fs.existsSync(wasmFilename)) {
    fs.unlinkSync(wasmFilename);
  }
  walt.compile(source).then((compilation) => {
    const buffer = compilation.buffer();
    fs.writeFileSync(wasmFilename, new Uint8Array(buffer));
    console.log('done.');
  });
} catch(e) {
  console.log(e);
}
*/
