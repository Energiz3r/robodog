const linspace = require("linspace");
const {Bezier} = require("bezier-js");

const s_vals = linspace(0.0, 1.0, 20);

const xmax = 1.0
const zmin = 10.0
const zmax = 15.0

const generateCurve = (nodes) => {
    const stepCurve = new Bezier(nodes);
    return s_vals.map(t => stepCurve.get(t));
}

const stepNodes = [
    {x: -xmax, y: -xmax, z: -zmin},
    {x: -xmax, y: -xmax, z: -zmax},
    {x: xmax, y: xmax, z: -zmax},
    {x: xmax, y: xmax, z: -zmin}
]
const slideNodes = [
    {x: xmax, y: xmax, z: -zmax},
    {x: -xmax, y: -xmax, z: -zmax}
]
const stepPath = generateCurve(stepNodes);
const slidePath = generateCurve(slideNodes);

let stepPathFast = stepPath.filter((node, i) => !(i % 2));
stepPathFast[stepPathFast.length - 1] = stepPath[stepPath.length - 1];

const basicGait = stepPathFast.concat(slidePath)
module.exports = basicGait