class Vector3 {
  constructor(x, y, z) {
    enforceTypes([x, y, z], "number");

    this.vector = new Float32Array([x, y, z]);
  }

  get x() {
    return this.vector[0];
  }

  get y() {
    return this.vector[1];
  }

  get z() {
    return this.vector[2];
  }

  add(other) {
    enforceTypes(other, Vector3);

    return new Vector3(this.x + other.x, this.y + other.y, this.z + other.z);
  }

  subtract(other) {
    enforceTypes(other, Vector3);

    return new Vector3(this.x - other.x, this.y - other.y, this.z - other.z);
  }

  dot(other) {
    enforceTypes(other, Vector3);

    return this.x * other.x + this.y * other.y + this.z * other.z;
  }

  cross(other) {
    enforceTypes(other, Vector3);

    return new Vector3(
      this.y * other.z - this.z * other.y,
      this.z * other.x - this.x * other.z,
      this.x * other.y - this.y * other.x,
    );
  }

  magnitude() {
    return Math.hypot(this.x, this.y, this.z);
  }

  length() {
    return this.magnitude();
  }

  normalize() {
    const mag = this.magnitude();
    if (mag === 0) {
      throw new Error("Cannot normalize a zero-length vector");
    }
    return new Vector3((this.x /= mag), (this.y /= mag), (this.z /= mag));
  }

  float32Array() {
    return this.vector;
  }
}
