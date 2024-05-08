const mapNumber = (number, in_min, in_max, out_min, out_max) => {
    return (number - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

const radToDegree = (rad) => {
    return (rad * 180) / Math.PI;
}

const lerp =  (x, y, a) => x * (1 - a) + y * a;

const clamp = (number, min, max) => {
    return Math.max(min, Math.min(number, max));
}

module.exports = {
    mapNumber,
    radToDegree,
    lerp,
    clamp
}