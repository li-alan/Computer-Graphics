var VSHADER_SOURCE=
  'attribute vec4 a_Position;\n'+
  'attribute float a_PointSize; \n'+
    //'uniform float u_CosB, u_SinB;\n' +
  'void main() {\n' +
  ' gl_Position = a_Position;\n' +
  ' gl_PointSize = a_PointSize;\n' +
  // '  gl_Position.x = a_Position.x * u_CosB - a_Position.y *u_SinB;\n'+
  //   '  gl_Position.y = a_Position.x * u_SinB + a_Position.y * u_CosB;\n'+
  //    '  gl_Position.z = a_Position.z;\n'+
  //     '  gl_Position.w = 1.0;\n' +
  '}\n';

var FSHADER_SOURCE=
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' + //uniform variable
  'void main() {\n' +
  ' gl_FragColor= u_FragColor;\n' +
  '}\n';


var shapeOption = 0;
function main() {
  //getting canvas element
  var canvas = document.getElementById('canvas');
  //get rendering context for webgl
  var gl = getWebGLContext(canvas);
  if(!canvas) {
    console.log('Failed to retrieve <canvas> element');
    return;
  }
  if(!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  //initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE,FSHADER_SOURCE)) {
    console.log('Failed to initialize shaders.');
    return;
  }

  //clear canvas once initially
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  //clear canvas button
  var clearCanvas = document.getElementById('cButton');
  clearCanvas.onclick=function() {
     gl.clearColor(0.0, 0.0, 0.0, 1.0);
     gl.clear(gl.COLOR_BUFFER_BIT);
     g_points= [];
     g_colors= [];
     g_size= [];
  }

  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  var a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');
  var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');

  var hourglass = document.getElementById('hgButton');
  hourglass.onclick=function() {
    shapeOption=3;
  }

  var triforce = document.getElementById('triButton');
  triforce.onclick=function() {
    shapeOption=4;
  }

  //drawing squares
  var square = document.getElementById('sqButton');
  square.onclick=function() {
    shapeOption=2;
  }
  //drawing triangles
  var triangle = document.getElementById('trButton');
  triangle.onclick=function() {
    shapeOption=0;
  }

  var circle = document.getElementById('ciButton');
  circle.onclick=function(){
    shapeOption=1;
  }

  var updateBackground=document.getElementById('bcButton');
  updateBackground.onclick=function() {
    var redBAMT=document.getElementById('redBSlider').value/255;
    var greenBAMT=document.getElementById('greenBSlider').value/255;
    var blueBAMT=document.getElementById('blueBSlider').value/255;

    gl.clearColor(redBAMT,greenBAMT,blueBAMT,1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    g_points= [];
    g_colors= [];
    g_size= [];
  }


  var hold = false;
  canvas.onmousedown = function(ev){
    click(ev, gl, canvas, a_Position,u_FragColor,a_PointSize)
    hold=true;
  }
  canvas.onmousemove= function(ev) {
    if(hold==true){
      click(ev, gl, canvas, a_Position,u_FragColor,a_PointSize)
    }
  }
  canvas.onmouseup=function(ev) {
    hold=false;
  }
}


function initVertexBuffers(gl,x,y,size,option,segments){
  if(option==0){
    var vertices = new Float32Array([x,y+size,x-size,y-size,x+size,y-size]);
    var n = 3;
  }else if(option==2){
    var vertices = new Float32Array([x-size/2,y+size/2,x+size/2,y+size/2,
      x+size/2,y-size/2,x-size/2,y+size/2,x-size/2,y-size/2,x+size/2,y-size/2]);
      var n = 6;
  }else if(option==1){
    // float 32 array doesn't support push function
    var n = segments*3;
    var circlePoints = [];
    var ANGLE = 360/segments;
    for(var i = 1,j=0; i<=segments; i++,j+=6){
      circlePoints.push(x,y);
      if(i==1){
        circlePoints.push(x,y+size/2);
        circlePoints.push(x+Math.sin(Math.PI * (ANGLE*i) / 180.0)*size/2);
        circlePoints.push(y+Math.cos(Math.PI * (ANGLE*i) / 180.0)*size/2);
      }else{
        circlePoints.push(circlePoints[j-2]);
        circlePoints.push(circlePoints[j-1]);
        circlePoints.push(x+Math.sin(Math.PI * (ANGLE*i) / 180.0)*size/2);
        circlePoints.push(y+Math.cos(Math.PI * (ANGLE*i) / 180.0)*size/2);
      }
    }
    var vertices = new Float32Array(circlePoints);
    var n = segments*3;
  }else if (option==3){
    var vertices = new Float32Array([x,y,x-size/2,y+size/2,x+size/2,y+size/2,
      x,y,x-size/2,y-size/2,x+size/2,y-size/2]);
      var n = 6;
  }else if (option==4){

    var vertices = new Float32Array([x,y+size/2,x+size/4,y,x-size/4,y,
        x+size/4,y,x,y-size/2,x+size/2,y-size/2,
        x-size/4,y,x,y-size/2,x-size/2,y-size/2]);
      var n = 9;
  }

  // var n = 3; //number of vertices
  //create buffer object
  var vertexBuffer = gl.createBuffer();
  if(!vertexBuffer) {
    console.log('Failed to create the buffer object ');
    return -1;
  }
  //bind buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  //write data in to buffer object
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');

  //assign buffer obj to position variable
  gl.vertexAttribPointer(a_Position,2,gl.FLOAT,false,0,0);

  //enable assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  return n;

}
var g_sSelect = [];
var g_points = []; //array for mouse press
var g_colors = [];
var g_size = [];
var g_option = [];
var g_segments = [];


//for drawing squares
function click(ev,gl,canvas,a_Position, u_FragColor,a_PointSize) {

  var redAMT=document.getElementById('redSlider').value/255;
  var greenAMT=document.getElementById('greenSlider').value/255;
  var blueAMT=document.getElementById('blueSlider').value/255;
  g_colors.push([redAMT,greenAMT,blueAMT,1,0]);

  var x = ev.clientX; //x coordinate of mouse pointer
  var y = ev.clientY; //y coordinate of mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.height/2)/(canvas.height/2);
  y = (canvas.width/2 - (y - rect.top))/(canvas.width/2);
  //store coordinates to g_points array
  g_points.push(x);
  g_points.push(y);
  var shapeSize=document.getElementById('sizeSlider').value;


  var sides=document.getElementById('csSlider').value;
  var s = shapeSize/400;
  g_size.push(s);
  //triangle
  if(shapeOption==0){
    g_option.push(0);
    g_segments.push(0);
  //square
  }else if(shapeOption==2){
    g_option.push(2);
    g_segments.push(0);
  //circle
  }else if(shapeOption==1){
    g_option.push(1);
    g_segments.push(sides);
  }
  else if(shapeOption==3){
    g_option.push(3);
    g_segments.push(0);
  } else if(shapeOption==4){
    g_option.push(4);
    g_segments.push(0);
  }


  gl.clear(gl.COLOR_BUFFER_BIT);
  var len=g_points.length;
  for(var i = 0,j=0; i<len;i+=2,j++){
    var rgba = g_colors[j];
    var n =initVertexBuffers(gl,g_points[i],g_points[i+1],g_size[j],g_option[j],g_segments[j]);
    gl.uniform4f(u_FragColor, rgba[0],rgba[1],rgba[2],rgba[3]);
    gl.drawArrays(gl.TRIANGLES, 0, n);
  }


}
