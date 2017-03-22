var chroma = require ("chroma-js");
var Utils = require ("./utils");
/**
* @constructor canvasMeter
* look at options for tweakables
* @param {Canvas} canvasElem
*/
function canvasMeter (canvasElem) {
  const self = this;
  const canvas = canvasElem;
  let options = {
    meter: {
      ramp:[
        {stop:0, color:'#F44336'},
        {stop:.4,color:'#FFEB3B'},
        {stop:.49,color:'#4CAF50'},
        {stop:.5,color:'#FFFFFF'},
        {stop:.51,color:'#4CAF50'},
        {stop:.6,color:'#FFEB3B'},
        {stop:1,color:'#F44336'}
      ],
      colors: {
        background:'#212121',
        label:'#FFFFFF',
        tickLabel:'#FAFAFA'
      },
      offsets: {
        ideal:-14,
        value:-160,
        label:-36,
        meter:-20,
        tickLabel:22,
        tick:-26,
        pointer:-12
      },
      ticks: {
        major:{
          height:12,
          width:2,
          count:5
        },
        minor:{
          height:6,
          width:2,
          count:3
        },
        pointer: {
          height:8,
          width:28
        }
      },
      fonts: {
        label:'24pt sans',
        tickLabel:'8pt sans',
        ideal:'16pt sans',
        value:'16pt sans',
      },
      formatters: {
        value:(v) => typeof v===typeof undefined ? "" :`${v.toFixed(1).toString()}hz`,
        ideal:(v) => typeof v===typeof undefined ? "" : `${v.toFixed(1).toString()}hz`,
        label:(v) => typeof v===typeof undefined ? "" : `${v.toString()}`,
        tickLabel:(v) => typeof v===typeof undefined ? "" : `${Math.round(v).toString()}`,
      },
      arc: {
        size:.8,
        width:8
      }
    }
  };

   /**
   * get  options
   * @return {object} options
   */
  self.getOptions = () => options;
  
  /**
   * merge options
   * @param {object} newOptions to merge
   * @return {object} self
   */
  self.setOptions = (newOptions) => {
    options = Utils.vanMerge ([options, newOptions]);
    return self;
  }
  /**
   * draw a meter
   * @param {number} value the value to meter
   * @param {number} low the low value to show on the meter
   * @param {number} high the high value to show on the meter 
   * @param {number} ideal the ideal value to show on the meter if required
   * @param {string} label the label to use if required
   */
  self.draw = (value, low , high , ideal, label) => {
    label = label || "";
    window.requestAnimationFrame(function () {
      drawMeterx( value, low , high , ideal, label);
    });
    return self;
  };

  function drawMeterx( value, low , high , ideal, label) {

    // set up canvas
    const ctx = canvas.getContext("2d");
    const om = options.meter;
    const width= canvas.width;
    let height = canvas.height;
    ctx.clearRect (0,0,width,height);
    ctx.save();

    // set up context and color stops
    const innerRadius = om.arc.size*width/2;
    const ramp = ctx.createLinearGradient(-innerRadius,innerRadius / 2,innerRadius, innerRadius / 2);
    options.meter.ramp.forEach (d=>ramp.addColorStop(d.stop,d.color));

    // there doesnt seem to be a way to extract values
    // from the linear gradient, so I'll use chroma
    // it looks like the lineargradients uses the RGB color space (chroma default)
    const chromaRamp = chroma.scale(options.meter.ramp.map(d=> d.color))
    .domain(options.meter.ramp.map(d=>d.stop));

    ctx.fillStyle = om.colors.background;
    ctx.fillRect(0, 0, width, height);

    //we'll translate to the bottom middle of the meter
    height = om.offsets.meter + height;
    ctx.translate (width/2, height);

    //-----the inner circle
    ctx.beginPath();
    ctx.arc(0, 0, innerRadius,  Math.PI,0, false);
    ctx.lineWidth = om.arc.width;
    ctx.strokeStyle = ramp;
    ctx.stroke();
    ctx.closePath();

    //------the ticks
    // offsets are how far from the edge of meter the ticks start
    const outerTickRadius = innerRadius - om.offsets.tick ;
    const innerTickRadius = innerRadius - om.offsets.tick -  om.ticks.major.height;
    const minorTickRadius = innerRadius - om.offsets.tick -  om.ticks.minor.height;
    const innerPointerRadius = innerRadius - om.offsets.pointer - om.ticks.pointer.height;
    const outerPointerRadius = innerRadius - om.offsets.pointer ;
    const tickLabelRadius = innerRadius - om.offsets.tickLabel ;
    const unit = 1/(om.ticks.major.count-1);
    
    // ticks
    for (let i=0; i<om.ticks.major.count;i++) {

      ctx.beginPath();
      ctx.lineWidth = om.ticks.major.width;
      let ramp = i*unit;

      // the angle will be in radians
      let angle = Math.PI - ramp * Math.PI;

      // get the x, y of the outer radius
      let sy = - Math.sin (angle)*outerTickRadius;  
      let sx = Math.cos (angle)*outerTickRadius;
      ctx.moveTo(sx,sy);

      // and do the same for the inner tick
      let isy =  - Math.sin (angle)*innerTickRadius;  
      let isx = Math.cos (angle)*innerTickRadius;
      ctx.lineTo(isx,isy);

      // emulate the linear gradient color using chroma
      ctx.strokeStyle = chromaRamp (ramp).hex();
      ctx.stroke();
      ctx.closePath();

      // the minor ticks    
      for (let j = 1 ; i < om.ticks.major.count-1 && j <= om.ticks.minor.count; j++) {
        ctx.beginPath();
        ctx.lineWidth = om.ticks.minor.width;
        let tramp = ramp + unit*j/(1+om.ticks.minor.count);

        // the angle will be in radians
        let tangle = Math.PI - tramp * Math.PI;
        // get the x, y of the outer radius
        let sy = - Math.sin (tangle)*outerTickRadius;  
        let sx = Math.cos (tangle)*outerTickRadius;
        ctx.moveTo(sx,sy);

        // and do the same for the inner tick
        let isy =  - Math.sin (tangle)*minorTickRadius;  
        let isx = Math.cos (tangle)*minorTickRadius;
        ctx.lineTo(isx,isy);

        // emulate the linear gradient color using chroma
        ctx.strokeStyle = chromaRamp (tramp).hex();
        ctx.stroke();
        ctx.closePath();
      }
    }

    // keep within limits of colorization and angle
    const normalValue = Math.min(Math.max (low,value),high);
    const pramp = (normalValue-low)/(high-low);
    const colorValue = chromaRamp (pramp).hex();

    // now the pointer  
    const pangle = Math.PI - pramp * Math.PI;

    // get the x, y of the outer radius
    let sy = - Math.sin (pangle)*outerPointerRadius;  
    let sx = Math.cos (pangle)*outerPointerRadius;


    // and do the same for the left  + right most point of the pointer triangle
    // we can get the angle with C = acos ((a2+b2-c2)/2ab) 
    let a2 = Math.pow(innerPointerRadius,2);
    let C = Math.acos ((a2+a2-om.ticks.pointer.width/2)/(2*a2));
    let rsy =  - Math.sin (pangle-C)*innerPointerRadius;  
    let rsx = Math.cos (pangle-C)*innerPointerRadius;

    let lsy =  - Math.sin (pangle+C)*innerPointerRadius;  
    let lsx = Math.cos (pangle+C)*innerPointerRadius;



    // now the tick labels
    ctx.textAlign = "center";
    ctx.fillStyle = om.colors.tickLabel;
    ctx.font = om.fonts.tickLabel;
    for (let i=0;i<om.ticks.major.count;i++) {
      let p = i/(om.ticks.major.count-1);
      let langle =  Math.PI - p * Math.PI;
      
      // get the x, y of the tick position radius
      let tsy = - Math.sin (langle)*tickLabelRadius;  
      let tsx = Math.cos (langle)*tickLabelRadius;  
      ctx.fillText(om.formatters.tickLabel(low + p*(high-low)),tsx,tsy);  
    }
    // draw the triangle, but use an easer
    ctx.beginPath();
    ctx.moveTo(lsx,lsy);
    ctx.lineTo(sx,sy);
    ctx.lineTo(rsx,rsy);
    ctx.closePath();
    // commit
    ctx.lineWidth=1;
    ctx.strokeStyle =  colorValue;
    ctx.stroke();

    // fill the triangle
    ctx.fillStyle = colorValue;
    ctx.fill();

    // now the labels
    ctx.textAlign = "center";
    ctx.fillStyle = om.colors.label;

    // color the value to follow dial
    ctx.fillStyle = colorValue;
    ctx.font = om.fonts.value;
    ctx.fillText(om.formatters.value(value),0,om.offsets.value);

    ctx.fillStyle = om.colors.label;
    ctx.font = om.labelFont;
    ctx.fillText(om.formatters.label(label),0,om.offsets.label);

    ctx.fillStyle = om.colors.label;
    ctx.font = om.idealFont;
    ctx.fillText(om.formatters.ideal(ideal),0,om.offsets.ideal);
    ctx.restore();

  }

}

module.exports = canvasMeter;

// Allow use of default import syntax in TypeScript
module.exports.default = canvasMeter;
