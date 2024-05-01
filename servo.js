var chalk = require('chalk');

let i2cBus;
let Pca9685Driver;

try {
    i2cBus = require('i2c-bus');
    Pca9685Driver = require('pca9685').Pca9685Driver;
} catch (error) {
    console.log(chalk.yellow('Hardware-related libraries are not installed. Using dummy classes instead'));

    // This is where you would define or import your dummy classes
    i2cBus = class {
        constructor() {
            console.log('Dummy i2c-bus class');
        }
    }

    Pca9685Driver = class {
        constructor() {
            console.log('Dummy Pca9685Driver class');
        }
    }
}

class Servo {

    angle = 0;
    pulse_width_range = [0, 0];
    constructor() {
        //this.angle = 0;
        //this.pulse_width_range = [0, 0];
    }

    setAngle(degrees) {
        this.angle = degrees
    }

    set_pulse_width_range(min, max) {
        this.pulse_width_range = [min, max];
        //console.log(`Servo: Pulse width range set to (${min}, ${max})`);
    }
}

class ServoKit {
    channels = 0;
    servo = [];
    constructor(channels) {
        this.channels = channels;
        this.servo = Array(channels)
            .fill()
            .map(() => new Servo());
    }
}

module.exports = ServoKit;