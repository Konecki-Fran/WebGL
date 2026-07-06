/**
Class uses Column-Major Layout for matrices to fit the WebGL conventions
**/

function multiply(a, b) {
  const out = new Float32Array(16);

  // Cache matrix values into local variables for performance gains
  const a00 = a[0],
    a01 = a[1],
    a02 = a[2],
    a03 = a[3];
  const a10 = a[4],
    a11 = a[5],
    a12 = a[6],
    a13 = a[7];
  const a20 = a[8],
    a21 = a[9],
    a22 = a[10],
    a23 = a[11];
  const a30 = a[12],
    a31 = a[13],
    a32 = a[14],
    a33 = a[15];

  let b0, b1, b2, b3;

  // Multiply Column 0
  b0 = b[0];
  b1 = b[1];
  b2 = b[2];
  b3 = b[3];
  out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

  // Multiply Column 1
  b0 = b[4];
  b1 = b[5];
  b2 = b[6];
  b3 = b[7];
  out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

  // Multiply Column 2
  b0 = b[8];
  b1 = b[9];
  b2 = b[10];
  b3 = b[11];
  out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

  // Multiply Column 3
  b0 = b[12];
  b1 = b[13];
  b2 = b[14];
  b3 = b[15];
  out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

  return out;
}

function createIdentity() {
  return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
}

function createTranslation(tx, ty, tz) {
  const m = createIdentity();
  m[12] = tx;
  m[13] = ty;
  m[14] = tz;
  return m;
}

function createScale(sx, sy, sz) {
  const m = createIdentity();
  m[0] = sx;
  m[5] = sy;
  m[10] = sz;
  return m;
}

function lookAt(eye, center, up) {
  enforceTypes([eye, center, up], Vector3);

  const fwd = new Vector3(
    eye.x - center.x,
    eye.y - center.y,
    eye.z - center.z,
  ).normalize();
  up = up.normalize();
  const right = fwd.cross(up).normalize();

  return new Float32Array([
    right.x,
    right.y,
    right.z,
    0,
    up.x,
    up.y,
    up.z,
    0,
    -fwd.x,
    -fwd.y,
    -fwd.z,
    1,
  ]);
}

/*****************************************/
// ROTATIONS

// Degrees to radians multiplier
const DTRM = Math.PI / 180.0;

function toRadians(degrees) {
  return degrees * DTRM;
}

// Angles are in degrees
function createRotationX(x) {
  const m = new Float32Array(16);
  const angleInRadians = toRadians(x);
  const c = Math.cos(angleInRadians); // FIX: Changed Rx to angleInRadians
  const s = Math.sin(angleInRadians); // FIX: Changed Rx to angleInRadians

  m[0] = 1;
  m[1] = 0;
  m[2] = 0;
  m[3] = 0;
  m[4] = 0;
  m[5] = c;
  m[6] = s;
  m[7] = 0;
  m[8] = 0;
  m[9] = -s;
  m[10] = c;
  m[11] = 0;
  m[12] = 0;
  m[13] = 0;
  m[14] = 0;
  m[15] = 1;

  return m;
}

// Angles are in degrees
function createRotationY(y) {
  const m = new Float32Array(16);
  const angleInRadians = toRadians(y);
  const c = Math.cos(angleInRadians);
  const s = Math.sin(angleInRadians);

  m[0] = c;
  m[1] = 0;
  m[2] = -s;
  m[3] = 0;
  m[4] = 0;
  m[5] = 1;
  m[6] = 0;
  m[7] = 0;
  m[8] = s;
  m[9] = 0;
  m[10] = c;
  m[11] = 0;
  m[12] = 0;
  m[13] = 0;
  m[14] = 0;
  m[15] = 1;

  return m;
}

// Angles are in degrees
function createRotationZ(z) {
  const m = new Float32Array(16);
  const angleInRadians = toRadians(z);
  const c = Math.cos(angleInRadians);
  const s = Math.sin(angleInRadians);

  m[0] = c;
  m[1] = s;
  m[2] = 0;
  m[3] = 0;
  m[4] = -s;
  m[5] = c;
  m[6] = 0;
  m[7] = 0;
  m[8] = 0;
  m[9] = 0;
  m[10] = 1;
  m[11] = 0;
  m[12] = 0;
  m[13] = 0;
  m[14] = 0;
  m[15] = 1;

  return m;
}

// Angles are in degrees
function createRotationXYZ(x = 0, y = 0, z = 0) {
  const out = new Float32Array(16);

  const xRad = toRadians(x);
  const yRad = toRadians(y);
  const zRad = toRadians(z);

  const cx = Math.cos(xRad),
    sx = Math.sin(xRad);
  const cy = Math.cos(yRad),
    sy = Math.sin(yRad);
  const cz = Math.cos(zRad),
    sz = Math.sin(zRad);

  out[0] = cy * cz;
  out[1] = sz * cy;
  out[2] = -sy;
  out[3] = 0;

  out[4] = sy * sx * cz - sz * cx;
  out[5] = sy * sz * sx + cz * cx;
  out[6] = sx * cy;
  out[7] = 0;

  out[8] = sy * cz * cx + sz * sx;
  out[9] = sy * sz * cx - sx * cz;
  out[10] = cy * cx;
  out[11] = 0;

  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;

  return out;
}

// ROTATIONS
/*****************************************/

function createTransformation({ T, R, S } = {}) {
  const targetT = T || createIdentity();
  const targetR = R || createIdentity();
  const targetS = S || createIdentity();

  // FIX: Standard TRS order via the corrected multiply() function name
  const RS = multiply(targetR, targetS);
  return multiply(targetT, RS);
}

function transformVector(matrix, vec3) {
  const x = vec3[0];
  const y = vec3[1];
  const z = vec3[2];

  const w = 1.0;

  const nx = matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12] * w;
  const ny = matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13] * w;
  const nz = matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14] * w;

  return [nx, ny, nz];
}

function multiplyScalar(matrix, scalar) {
  for (i = 0; i < 16; i++) {
    matrix[i] *= scalar;
  }
  return matrix;
}

/*****************************************/
