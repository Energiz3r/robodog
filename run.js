var bezier = require("bezier");
var linspace = require("linspace");
var ndarray = require("ndarray");

console.log(bezier([0, 1, 2], 0.5));
console.log(linspace(1, 5, 15));
var x = ndarray(new Float32Array(25), [5, 5]);
var y = x.hi(4, 4).lo(1, 1);

for (var i = 0; i < y.shape[0]; ++i) {
  for (var j = 0; j < y.shape[1]; ++j) {
    y.set(i, j, 1);
  }
}
console.log(y);
