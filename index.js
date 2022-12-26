const ir          = require('ir-receiver').connect(P0);
const light       = require('led').connect(P1);
const lightSensor = require('light-sensor').connect(A0);
const servo       = require('servo').connect(P8).write(0);

const decrementButton = 378124359;
const incrementButton = 378101919;
const modeButtonOff   = 378126399;
const modeButtonOn    = 378077439;
const servoMaxValue   = 90;
const servoMinValue   = 0;
let isAutoMode        = true;

const setServoValue = (value) => {
  servo.write(value);
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
      if (code === incrementButton) {
        setServoValue(servoMaxValue);
      } else if (code === decrementButton) {
        setServoValue(servoMinValue);
      }
    }
  }
});

const handleLuxesCheck = (luxes) => {
  if (isAutoMode) {
    if (luxes > 50) {
      setServoValue(servoMaxValue);
    } else {
      setServoValue(servoMinValue);
    }
  }
};

setInterval(() => {
  let luxes = lightSensor.read('lx').toFixed(0);
  handleLuxesCheck(luxes);
}, 1000);
