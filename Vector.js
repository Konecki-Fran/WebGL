class Vector3 {
  constructor(x, y, z) {
    if (
      !(typeof x === "number" && typeof z === "number" && typeof z === "number")
    ) {
      throw TypeError(
        "Vector3.constructor must be called with arguments of type number of Array of numbers!",
      );
    }
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
    enforceClass(other, "add");

    return new Vector3(this.x + other.x, this.y + other.y, this.z + other.z);
  }

  subtract(other) {
    enforceClass(other, "subtract");

    return new Vector3(this.x - other.x, this.y - other.y, this.z - other.z);
  }

  dot(other) {
    enforceClass(other, "dot");

    return this.x * other.x + this.y * other.y + this.z * other.z;
  }

  cross(other) {
    enforceClass(other, "cross");

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

  enforceClass(other, functionName) {
    if (!(other instanceof Vector3)) {
      throw TypeError(
        "Vector3." + functionName + " called with non-Vector3 argument!",
      );
    }
  }
}
