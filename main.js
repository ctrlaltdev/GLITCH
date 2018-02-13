var input = document.createElement( 'input' );
input.type = 'file';
input.onchange = function(){
  if( url ){ window.URL.revokeObjectURL( url ); }
  image.src = window.URL.createObjectURL( input.files[ 0 ] );
  document.body.removeChild( input );
};
document.body.appendChild( input );

var image = new Image();
var jpgGlitch = new JpgGlitch();

var url;

var params = {};

params.quality = 0.555;
params.quant = 0.333;
params.glitch = 0.333;
params.active = true;
params.download = true;

var gui = new dat.GUI();
gui.add( params, 'quality', 0.0, 1.0 );
gui.add( params, 'quant', 0.0, 1.0 );
gui.add( params, 'glitch', 0.0, 1.0 );
gui.add( params, 'active' );
gui.add( params, 'download' );

var img;

var firstLoad = true;
image.onload = function(){
  if( firstLoad ){
    img = new Image();
    document.body.appendChild( img );
    update();
    firstLoad = false;
  }
};

var update = function(){
  if ( params.active ) {
    params.seed = Math.random();
    jpgGlitch.glitch( image, params );
    img.src = jpgGlitch.url;
    if ( params.download ) {
      var a = document.createElement( 'a' );
      a.href = jpgGlitch.url;
      a.download = 'download.jpg';
      a.click();
      params.download = false;
    }
  }
  //requestAnimationFrame( update );
};

var generate = document.createElement('button');
generate.id = 'generate';
var generateTxt = document.createTextNode('Generate');
generate.appendChild(generateTxt);
document.body.appendChild(generate);

document.getElementById('generate').addEventListener('click', () => {
  update();
});
