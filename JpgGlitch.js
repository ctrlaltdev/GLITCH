var JpgGlitch = function(){

  var it = this;

  it.preCanvas = document.createElement( 'canvas' );
  it.preContext = it.preCanvas.getContext( '2d' );

  it.canvas = document.createElement( 'canvas' );
  it.context = it.canvas.getContext( '2d' );

  it.url = '';

  it.createWorker();

};

JpgGlitch.prototype.createWorker = function(){

  var it = this;

  var f = function(){

    var tableSize = 1000000;
    var table = [];
    for( var i = 0; i < tableSize; i ++ ){
      table[ i ] = Math.random();
    }
    var tableIndex = 0;
    var t = function(){
      tableIndex = ( tableIndex + 1 ) % tableSize;
      return table[ tableIndex ];
    };

    onmessage = function( _event ){

      var params = {
        quality : 0.5,
        quant : 0.1,
        glitch : 0.3,
        seed : 0.0
      };
      for( var key in _event.data.params ){
        params[ key ] = _event.data.params[ key ];
      }

      tableIndex = ~~( params.seed % 1 * tableSize );

      var quantChance = Math.exp( ( params.quant - 1.0 ) * 6.0 );
      if( params.quant <= 0.0 ){ quantChance = 0.0; }

      var glitchChance = Math.exp( ( params.glitch - 1.0 ) * 5.0 );
      if( params.glitch <= 0.0 ){ glitchChance = 0.0; }
      glitchChance *= 1E3 / _event.data.width / _event.data.height;

      var seg = 255;
      var len = 0;
      var off = 0;
      var quanted = false;

      var data = atob( _event.data.data.split( 'base64,' )[ 1 ] );
      var array = new Uint8Array( data.length );
      for( var i=0; i<data.length; i++ ){

        var d = data.charCodeAt( i );

        if( d === 255 ){
          len = 0;
        }

        if( 4 < len ){
          array[ i ] = d;

          if( seg === 219 && !quanted && t() < quantChance ){
            array[ i ] = t() * 256;
          }

          if( seg === 218 && t() < glitchChance ){
            array[ i ] = t() * 256;
          }

          array[ i ] &= 255;
        }else{
          if( len === 1 ){
            if( d !== 0 ){
              seg = d;
            }else if( seg === 219 ){
              quanted = true;
            }
          }

          array[ i ] = d;
        }
        len ++;

      }

      self.postMessage( new Blob( [ array ], { type : 'image/jpeg' } ) );

    };

  };

  var str = '(' + f.toString() + ')();';
  var blob = new Blob( [ str ], { type : 'text/javascirpt' } );
  it.workerURL = window.URL.createObjectURL( blob );
  it.worker = new Worker( it.workerURL );

  it.worker.addEventListener( 'message', function( _event ){
    if( it.url ){ window.URL.revokeObjectURL( it.url ); }
    it.url = window.URL.createObjectURL( _event.data );

    var image = new Image();
    image.onload = function(){
      it.canvas.width = it.preCanvas.width;
      it.canvas.height = it.preCanvas.height;
      it.context.clearRect( 0, 0, it.preCanvas.width, it.preCanvas.height );
      it.context.drawImage( image, 0, 0 );
      image = null;
    };
    image.src = it.url;
  } );

};

JpgGlitch.prototype.remove = function(){

  var it = this;

  if( it.url ){ window.URL.revokeObjectURL( it.url ); }
  if( it.workerURL ){ window.URL.revokeObjectURL( it.workerURL ); }

};

JpgGlitch.prototype.glitch = function( _input, _params ){

  var it = this;

  it.preCanvas.width = _input.width;
  it.preCanvas.height = _input.height;

  it.preContext.clearRect( 0, 0, it.preCanvas.width, it.preCanvas.height );
  it.preContext.drawImage( _input, 0, 0 );

  it.worker.postMessage( {
    data : it.preCanvas.toDataURL( "image/jpeg", _params.quality ),
    width : it.preCanvas.width,
    height : it.preCanvas.height,
    params : _params
  } );

};
