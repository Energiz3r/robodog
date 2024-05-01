var chalk = require('chalk');

let i2cBus;
let Pca9685Driver;
let pca9685ODevice;

const mapNumber = (number, in_min, in_max, out_min, out_max) => {
    return (number - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

const dummyI2C = {
    openSync: (val) => {
    }
}

class dummyPCA {
    constructor(options, callback) {
        const bus = options.i2c
        console.log('Dummy Pca9685Driver class', bus);
        callback(false)
    }

    setPulseRange(channel, low, hi, callback) {
        //console.log("Dummy channel set pulse range", channel, low, hi)
    }

    setDutyCycle(channel, dutyCycle) {
        //console.log("Dummy channel set dutyCycle", channel, dutyCycle)
    }
}

try {
    i2cBus = require('i2c-bus');
    Pca9685Driver = require('pca9685').Pca9685Driver;
    //Pca9685Driver = require("./pca9685.js").Pca9685Driver;
    console.log(chalk.green('Hardware libraries OK!'));
} catch (error) {
    console.log(chalk.yellow('Hardware libraries not available! Simulating servo output.'));
    i2cBus = dummyI2C
    Pca9685Driver = dummyPCA
}

const pca9685Options = {
    i2c: i2cBus.openSync(0),
    address: 0x40,
    frequency: 50,
    debug: false
};

class Servo {

    channel = 0;
    isReady = false;

    constructor(channel) {
        this.channel = channel;
    }

    init() {
        pca9685ODevice.setPulseRange(this.channel, 500, 2500)
        this.isReady = true;
    }

    setAngle(degrees) {
        //const dutyCycle = mapNumber(degrees, 0, 180, 0.0, 1.0)
        //console.log(Math.floor(degrees), dutyCycle)
        //pca9685ODevice.setDutyCycle(this.channel, dutyCycle)

        const pulseLength = mapNumber(degrees, 0, 180, 500, 2500)
        pca9685ODevice.setPulseLength(this.channel, pulseLength)
    }
}

class ServoController {
    servo = [];
    isReady = false;

    constructor() {
        console.log("Servo controller created!")
        this.servo = Array(16)
            .fill()
            .map((_, i) => new Servo(i));
        this.initialize().then(() => {
            this.servo.forEach(servo => servo.init())
            this.isReady = true;
        }).catch(err => {
            console.error("Error initializing PCA9685!", err);
            process.exit(-1);
        })
    }

    initialize() {
        return new Promise((resolve, reject) => {
            pca9685ODevice = new Pca9685Driver(pca9685Options, (err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log("PCA9685 initialized!");
                    resolve();
                }
            });
        });
    }
}

module.exports = ServoController;
