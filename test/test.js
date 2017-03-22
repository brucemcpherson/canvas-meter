var canvasMeter = require ("../dist/lib/meter");
window.onload = function () {
// skins
const getSpeedoSkin = () => {
  return {
    meter:{
      offsets:{
        tick:8,
        tickLabel:34,
        value:0,
        pointer:44
      },
      ramp:[
        {stop:0, color:'#FFFFFF'},
        {stop:.2,color:'#2196F3'},
        {stop:.3,color:'#4CAF50'},
        {stop:.65,color:'#FFEB3B'},
        {stop:1,color:'#F44336'}
      ],
      colors:{
        background:'#455A64'
      },
      ticks:{
        major:{
          count:13
        },
        minor: {
          count:4,
          width:1
        },
        pointer: {
          height:50,
          width:8
        }
      },
      formatters: {
        value: function (v) { return Math.round(v.toString())},
        ideal: function (v) { return "";}
      }
    }
  };
};


function testSpeedo () {
  const meter = new canvasMeter(document.getElementById("speedo"));
  meter.setOptions (getSpeedoSkin());
  sim();

  function sim (x) {
    x= x || 0;
    setTimeout ( function () {
      meter.draw(30 + 40*Math.random(),0,120);
      if (x<40) {
        sim (x+1);
      }
    }, 1000);
  }
}

function testTuner () {
  const meter = new canvasMeter(document.getElementById("meter"));

  sim();

  function sim (x) {
    x= x || 0;
    setTimeout ( function () {
      meter.draw(400 + 40*Math.random(),400,480,440,"A");
      if (x<40) {
        sim (x+1);
      }
    }, 1000);
  }
  
}


  testSpeedo();
  testTuner();
};

