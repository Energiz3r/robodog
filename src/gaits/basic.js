const linspace = require("linspace");
const {Bezier} = require("bezier-js");

// generates two curves - the arc for stepping and a flat curve (line) for returning the foot to the start position

const s_vals = linspace(0.0, 1.0, 20);

const xmax = 1.0
const zmin = 10.0
const zmax = 15.0

const stepNodes = (xmax, zmin, zmax) => {
    return [
        {x: -xmax, y: -xmax, z: -zmin},
        {x: -xmax, y: -xmax, z: -zmax},
        {x: xmax, y: xmax, z: -zmax},
        {x: xmax, y: xmax, z: -zmin}
    ]
}

const slideNodes = (xmax, zmin) => {
    return [
        {x: xmax, y: xmax, z: -zmin},
        {x: -xmax, y: -xmax, z: -zmin}
    ]
}

const generateCurve = (nodes) => {
    const stepCurve = new Bezier(nodes);
    return s_vals.map(t => stepCurve.get(t));
}

// returns an array of {x,y,z} coords starting and beginning at the same coordinate
const generatePath = (xmax, zmin, zmax) => {
    const stepPath = generateCurve(stepNodes(xmax, zmin, zmax));
    const slidePath = generateCurve(slideNodes(xmax, zmin));
    return stepPath.concat(slidePath)
}

const basicGait = {
    a: generatePath(xmax, zmin, zmax),
    b: generatePath(xmax, zmax, zmin)
};

module.exports = basicGait