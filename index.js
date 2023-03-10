const ir          = require('ir-receiver').connect(P0);
const light       = require('led').connect(P1);
const lightSensor = require('light-sensor').connect(A0);
const servo       = require('servo').connect(P8);

const bottomButton  = 378124359;
const topButton     = 378101919;
const modeButtonOff = 378126399;
const modeButtonOn  = 378077439;
const stopButton    = 378091719;

const maxBright   = 5000;
const speedMaxCW  = 544;
const speedMaxCCW = 2400;
const speedStop   = (speedMaxCW + speedMaxCCW) / 2;

let currentCurtainState = 'top';
let isAutoMode          = true;

const setServoValue = (value) => {
  servo.write(value, 'us');
};

const servoStop = () => {
  setTimeout(() => {
    setServoValue(speedStop);
  }, 14500);
};

ir.on('receive', (code, repeat) => {
  if (code === modeButtonOn) {
    light.turnOn();
    isAutoMode = false;
  } else if (code === modeButtonOff) {
    light.turnOff();
    isAutoMode = true;
  }

  if (!isAutoMode) {
    if (repeat) {
      return;
    } else {
      if (code === topButton) {
        setServoValue(speedMaxCCW);
      } else if (code === bottomButton) {
        setServoValue(speedMaxCW);
      } else if (code === stopButton) {
        setServoValue(speedStop);
      }
    }
  }
});

const handleLuxesCheck = (luxes) => {
  if (isAutoMode) {
    if (luxes > maxBright && currentCurtainState === 'bottom') {
      return;
    } else if (luxes > maxBright && currentCurtainState !== 'bottom') {
      setServoValue(speedMaxCW);
      servoStop();
      currentCurtainState = 'bottom';
    } else if (luxes < maxBright && currentCurtainState === 'top') {
      return;
    } else if (luxes < maxBright && currentCurtainState !== 'top') {
      setServoValue(speedMaxCCW);
      servoStop();
      currentCurtainState = 'top';
    }
  }
};

setInterval(() => {
  let luxes = lightSensor.read('lx').toFixed(0);
  handleLuxesCheck(luxes);
}, 60000);
