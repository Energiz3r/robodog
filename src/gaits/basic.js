const linspace = require("linspace");
const {Bezier} = require("bezier-js");

// generates two curves - the arc for stepping and a flat curve (line) for returning the foot to the start position

const s_vals = linspace(0.0, 1.0, 20);

const xmax = 1.0
const zmax = 15.0
const zmin = 10.0

const step_nodes = [
    {x: -xmax, y: -xmax, z: -zmax},
    {x: -xmax, y: -xmax, z: -zmin},
    {x:  xmax, y:  xmax, z: -zmin},
    {x:  xmax, y:  xmax, z: -zmax}
]
const stepCurve = new Bezier(step_nodes);
const step = s_vals.map(t => stepCurve.get(t));

const slide_nodes = [
    {x: xmax, y: xmax, z: -zmax},
    {x: -xmax, y: -xmax, z: -zmax}
];
const slideCurve = new Bezier(slide_nodes);
const slide = s_vals.map(t => slideCurve.get(t));

// returns an array of {x,y,z} coords starting and beginning at the same coordinate
const basicGait = step.concat(slide)

module.exports = basicGait