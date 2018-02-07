/* global THREE theCamera theDate theControls theConfig theScene*/

// =============================================================================
// VIEWPORT ====================================================================
// =============================================================================
// Contains a Three.js renderer and element

function Viewport( id, width, height, widthOffset, heightOffset, enableAntiAliasing, clearColor ) {

  this.id = id;
  this.widthOffset = widthOffset;
  this.heightOffset = heightOffset;
  this.width = width;
  this.height = height;
  
  this.paused = false;
  
  this.enableAntiAliasing = enableAntiAliasing;

  this.renderer = new THREE.WebGLRenderer( {
    antialias: this.enableAntiAliasing,
    maxLights: 10
  } );

  this.setSize( this.width, this.height );
  
  this.renderer.setClearColor( clearColor, 1);

  this.renderer.shadowMapEnabled = true;
  this.renderer.shadowMapType = THREE.PCFSoftShadowMap;
  // this.renderer.shadowMapCascade = true;

  $( "#container" ).append( this.renderer.domElement );
  this.renderer.domElement.id = this.id;
  
  this.composer = new THREE.EffectComposer( this.renderer );
  
  this.setupEventHandlers();

}
Viewport.prototype.constructor = Viewport;

// setSize =====================================================================
// Changes the dimension of the viewport element and renderer to a specific size
Viewport.prototype.setSize = function( width, height ) {

  this.width = ( width * theConfig.video.resolutionModifier ) + this.widthOffset;
  this.height = ( height * theConfig.video.resolutionModifier ) + this.heightOffset;
  this.renderer.setSize( this.width, this.height );
  this.renderer.domElement.style.width = "100%";
  this.renderer.domElement.style.height = "100%";
  // this.renderer.domElement.style.width = window.innerWidth + "px";
  // this.renderer.domElement.style.height = window.innerHeight + "px";
};

// resize ======================================================================
// Called when the window is resized, use the setsize function and resets
// the threejs camera's properties to match the new size
Viewport.prototype.resize = function( width, height ) {

  if ( theCamera.mode === 0 ) {
    theCamera.setScale( theCamera.orthographicScale );
  } else {
    theCamera.camera.aspect = width / height;
    theCamera.camera.updateProjectionMatrix();
  }
  
  this.setSize( width, height );
};

// setupEventHandlers ==========================================================
// Get the events from the browser
Viewport.prototype.setupEventHandlers = function() {

  // By default when you use 'this' with an event, 'this' is the document, not
  // the object, so the using self is a work around so that 'this' will actually
  // refer to this object, not the document
  var self = this;

  window.addEventListener(
    'resize',
    function () { self.resize( window.innerWidth, window.innerHeight ); },
    false 
  );

};