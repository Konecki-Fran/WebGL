// Turn this off for production
const DEBUG = true;

function enforceTypes(variables, types) {
  if (!DEBUG) return;

  if (variables instanceof Array && types instanceof Array) {
    if (variables.length != types.length)
      throw Error("TypeChecker: Variables and Types of different lengths!");
  } else if (!(variables instanceof Array) && !(types instanceof Array)) {
    variables = [variables];
    types = [types];
  }

  for (var i = 0; i < variables.length; i++) {
    var v = variables[i];
    var t;
    if (types instanceof Array) {
      t = types[i];
    } else {
      t = types;
    }

    if (v instanceof Object) {
      if (!(v instanceof types))
        throw TypeError(
          "TypeChecker: " + toString(v) + " not of type " + toString(t),
        );
    } else {
      if (typeof t !== "string") {
        throw TypeError(
          "TypeChecker: Type " +
            toString(t) +
            "must be of Object or string type!",
        );
      }
      if (typeof v === t) {
        throw TypeError(
          "TypeChecker: " + toString(v) + " not of type " + toString(t),
        );
      }
    }
  }
}
