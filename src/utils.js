const mapNumber = (number, in_min, in_max, out_min, out_max) => {
    return (number - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

const radToDegree = (rad) => {
    return (rad * 180) / Math.PI;
}

module.exports = {
    mapNumber,
    radToDegree
}