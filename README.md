# robodog - the noob friendly quadruped robot

![robodog](./img/robodog.jpg)

### Credits: 

- "Baris ALP"
  - grabcad - https://grabcad.com/library/diy-quadruped-robot-1
- "[Jack Demeter](https://github.com/JackDemeter)"
  - grabcad - https://grabcad.com/library/quadruped-robot-w-code-1
  - github - https://github.com/JackDemeter/quadruped-robot

Baris designed the original robot, from which I used some of the electronics, the legs and some body parts.

Jack remixed the design, which I've taken inspiration to omit the rear "hip" servos from. He published Python code for a basic kinematic walk behaviour which I re-wrote in NodeJS.

## Approach

Unfortunately Baris shared no code and hasn't responded to comments, although he did mention using ROS. I attempted to learn ROS starting from zero experience with robotic development and found it to be way more complicated than I was prepared to deal with learning. If you wish to operate a robot like this *properly*, you should a) build a robot with closed-loop motor control, ie. not using R/C servos, and b) learn to create a physic simulation (for ROS, that would be in Gazebo as far I could tell) and have ROS operate your robot's motors based on actual physical simulation and accelerometer data.

This repo lets you control the robot and walk it around, but it's really just playing a fixed animation of the legs rather than 'knowing' how to walk.

Jack published code with his remix, but I had extreme difficulty and ultimately failed getting it to run on the OrangePi Zero LTS. This was due to python dependencies and differences between the distros which are a nightmare at the best of times. Not having an Rpi handy nor being prepared to buy one for the sake of Python, I re-wrote Jack's code in NodeJS. Use of Node reduces the only real compatibility challenges to surfacing the i2c interface at `/dev/i2c-*` to talk to the PWM controller.

## Assembly

Build the robot either according to Baris' or Jack's design and whatever parts you may already have or can buy locally. This is the easy part! You can optionally 3D print some parts I've included here as well. If you use Baris' design, omit the rear hip servos and either use mine or Jack's parts to mount those.

## Electronics Required

- OrangePi Zero LTS, or other Rpi / OrangePi board (untested)
- PCA9685 16-channel 12-bit PWM driver (Adafruit)
- 10x Servos
  - I used `SPT5535LV-210` Servos from Aliexpress. They're digital metal-gear units with 200&deg; rotation and a pulse width of 500&micro;s - 2500&micro;s.
  - There were many options to choose from; I selected both the 35kg rating (higher torque gearing reduces rotation speed) and included the optional red anodized aluminium arm, which I used.
  - Be aware if you stall these servos and have a powerful enough supply of current, they will burn very quickly. Make sure your robot is assembled and the servos properly positioned before you attach the legs.

Baris' design used a pair of regulators with adjustable voltage / current. I had issues with the servos jittering constantly and could not solve it with the current at maximum. I even went as far as adding additional capacitors to no avail.

I instead opted to power my servos directly from the battery I built, which is 4x 18650 cells wired in 2S2P for a nominal 7.4V. The servos I used are fine with this voltage and I imagine most will be as it's standard practice to power servos from a 2S LiPo in R/C cars. This many cells is quite heavy however, and at time of writing weight may be causing the issues with the gait that I'm experiencing. The robot runs for many hours on a single charge, so I'll say that 2S1P is likely plenty.

## Bill of Materials

Not including 3D printed parts. Note this repo does not contain design files from Baris or Jack's repos except those which I've modified. I'll later update this repo to be a complete single-source once I've worked out the details.

<details>
(draft)

- Orange Pi Zero
- Rocker switch - local electronics store
- 12x spt5435LV
- 2x dc-dc SZBK07 (* I did not use these. heavy!)
- 4x 18650 (I used Sony VTC6)
- battery indicator - choose to suit your battery configuration and chemistry
- 50X50X10mm fan
- 16x 5mm R/C tie rod end (HPI)
- 8x 603ZZ 3x9x5mm bearings
- You would need a 5v regulator to power the Orange Pi
- Assorted length M3 bolts and nyloc nuts

</details>

## Installation

Check that i2c is enabled for your board. For OrangePi and possibly other Armbian boards, run `sudo armbian-config`, select `System (System and security settings)` then `Hardware (Toggle hardware configuration)`, and mark i2c0 to enable it. Select save and you'll be prompted to reboot your OrangePi.

- Clone the repo
- run `npm install`
- edit `config.js`
  - set the pin assignments for your Servos to the PCA9685 PWM controller
  - set `calibrate: true` so your servos are in centre position to attach the legs
  - under pca9685, the `i2cDevice` value corresponds to your device in linux, eg. for `/dev/i2c0` or `/dev/i2c-0` you would set this to `0`. (use `ls -l /dev/i2c*` to check. If not found, you need to enable i2c for your board)  
- run `node robot.js` or use `npm run start`
- access the page at `http://<device IP>:3000` and use the buttons or WASD to control the robot

**Note about hardware dependencies:**

Hardware-specific dependencies are set as optional in `package.json`:
```json
"optionalDependencies": {
    "i2c-bus": "^5.2.3",
    "pca9685": "^5.0.0"
}
```
You can therefore do the install on a desktop OS and run the software, but i2c and the PCA9685 will be simulated and do nothing - you will see a message in console to confirm whether or not the hardware dependencies are OK or being simulated. All of the kinematic calculations are still executed so this was handy for development.

## Development Status

Overall status

- Right now the code works but the robot walks poorly. I'm not sure yet whether it's a physical or software issue. I think my robot is too heavy.
- I'm absolutely useless when it comes to 3D modelling. The parts I've modified were done so in [123D Design](https://autodesk-123d-design.en.lo4d.com/windows), a discontinued piece of *very* basic software from Autodesk. If you want proper design files you'll need to make / convert them yourself 

There are a couple of things that Jack's python program can do that are missing from this:
- direct keyboard control (keyboard plugged into the Pi). Not planning to add this as the OrangePi Zero LTS is headless-only and I can't see much use for it
- camera following. Pretty awesome and key feature, but my OrangePi Zero LTS has no camera port. I may buy a new Pi later so I can develop this
- direct keyboard control over the network (socket). A web interface with socket.io seems more practical and flexible, plus you can use your phone!
- gait for climbing stairs. On my to-do list

Other things I have planned:
- poses / emotes
  - design charging base for it to sit on
- speaker for speech / text-to-speech via LLM + Whisper
- config management via web interface
- turn on / off servo power via web interface
