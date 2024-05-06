const { plot } = require('nodeplotlib');
const basicGait = require('./src/gaits/basic')
const {applyMomentumToCurve3d} = require("./src/kinematics");

const momentum = { longitudinal: 4, lateral: 0, vertical: 1};

const coords = applyMomentumToCurve3d(momentum, basicGait.b)
const { x, y, z } = coords

const data = [
    {
        x: x,
        y: z,
        z: y,
        type: 'scatter3d',
        mode: 'lines'
    }
];

const layout = {
    title: '3D Robot Walk Animation',
    autosize: true,
    width: 1000,
    height: 1000,
    margin: {
        l: 0,
        r: 0,
        b: 0,
        t: 65
    }
};

plot(data, layout);