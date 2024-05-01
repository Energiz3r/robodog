var chalk = require('chalk');

let i2cBus;
let Pca9685Driver;

try {
    i2cBus = require('i2c-bus');
    Pca9685Driver = require('pca9685').Pca9685Driver;
    console.log(chalk.green('Hardware libraries OK!'));
} catch (error) {
    console.log(chalk.yellow('Hardware libraries not available! Simulating servo output.'));
    i2cBus =  {
        openSync: (val) => {
        }
    }
    Pca9685Driver = class {
        constructor(options, callback) {
            console.log('Dummy Pca9685Driver class');
            callback(false)
        }
        setPulseRange(channel, low, hi, callback){
            console.log("Dummy channel set pulse range", channel, low, hi)
            callback(false)
        }

        setPulseLength(channel, len){
            console.log("Dummy channel set pulse length", channel, len)
        }

        setDutyCycle(channel, dutyCycle){
            console.log("Dummy channel set dutyCycle", channel, dutyCycle)
        }

        channelOff(channel, callback){
            console.log("Dummy channel set off", channel)
            callback(false)
        }

        channelOn(channel){
            console.log("Dummy channel set on", channel)
        }
    }
}

const pca9685Options = {
    i2c: i2cBus.openSync(1),
    address: 0x40,
    frequency: 50,
    debug: false
};

pwm = new Pca9685Driver(pca9685Options, function(err) {
    if (err) {
        console.error("Error initializing PCA9685");
        process.exit(-1);
    }
    console.log("PCA9685 initialization done");

});

const testServo = () => {
    // Set channel 0 to turn on on step 42 and off on step 255
    // (with optional callback)
    pwm.setPulseRange(0, 42, 255, function(err) {
        if (err) {
            console.error("Error setting pulse range.");
        }
    });

    // Set the pulse length to 1500 microseconds for channel 2
    pwm.setPulseLength(2, 1500);

    // Set the duty cycle to 25% for channel 8
    pwm.setDutyCycle(8, 0.25);

    // Turn off all power to channel 6
    // (with optional callback)
    pwm.channelOff(6, function(err) {
        if (err) {
            console.error("Error turning off channel.");
        }
    });

    // Turn on channel 3 (100% power)
    pwm.channelOn(3);
}

testServo();

class Servo {

    angle = 0;
    pulse_width_range = [0, 0];
    constructor() {
        //this.angle = 0;
        //this.pulse_width_range = [0, 0];
    }

    setAngle(degrees, log) {
        //if (log) console.log(Math.floor(degrees))
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