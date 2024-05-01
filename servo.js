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