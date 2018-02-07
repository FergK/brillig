/* global THREE CANNON UI requestAnimationFrame cancelAnimationFrame Config Overlay Detector State Viewport CamControl Inputs KeyboardInput MouseInput World Entity Player PlayerState*/
"use strict";

// Definining reusable global constants
const X_AXIS = new THREE.Vector3( 1, 0, 0 );
const Y_AXIS = new THREE.Vector3( 0, 1, 0 );
const Z_AXIS = new THREE.Vector3( 0, 0, 1 );
const X_AXIS_NEG = new THREE.Vector3( -1, 0, 0 );
const Y_AXIS_NEG = new THREE.Vector3( 0, -1, 0 );
const Z_AXIS_NEG = new THREE.Vector3( 0, 0, -1 );

var theTimer = new THREE.Clock( false );
var theTimeDelta, theFrameRate;
var theTimeDeltaAverage = 0;
var theDate = new Date();
var theFrameCount = 0;

// localStorage.clear();

var theConfig = new Config();
theConfig.loadFromLocalStorage();

var theOverlay = new Overlay();
var theViewport, theScene, theCamera, theInputs, theWorld, thePlayer, theAnimationRequest;

// Start screen state
var startState = new State();
startState.onEnter = function() {
  theOverlay.elements.titleBar.toggle( true );
  theOverlay.elements.startBox.toggle( true );
  // Detector.updateDetectorMessage( "detectorMessage", "startButton" );
};
startState.onExit = function() {
  theOverlay.elements.startBox.toggle( false );
};

// Options screen state
var optionsState = new State();
optionsState.onEnter = function() {
  theOverlay.elements.optionsBox.toggle( true );
};
optionsState.onExit = function() {
  theOverlay.elements.optionsBox.toggle( false );
  theConfig.saveToLocalStorage();
};

// Initialize the game for playing, loading world etc.
var initState = new State();
initState.onEnter = function() {

  theScene = new THREE.Scene();
  theViewport = new Viewport( "viewport", window.innerWidth, window.innerHeight, 0, 0, theConfig.video.enableAntiAliasing, 0x82aef3 );
  
  theWorld = new World();
  theWorld.setScene();
  
  // Axis helper
  var axisHelper = new THREE.AxisHelper( 50 );
  axisHelper.position.set( 0, 0, 0 );
  theScene.add( axisHelper );
  
  // Add the "Player"
  thePlayer = new Player();
  // thePlayer.state.current = new PlayerState( thePlayer.state.builder );
  // thePlayer.state.current.setState( thePlayer.state.interact );
  thePlayer.addToWorld();
  
  theCamera = new CamControl( 3, thePlayer );
  theCamera.targetPositionLock = true;
  
  // Postprocessing
  // 	theViewport.composer.addPass( new THREE.RenderPass( theScene, theCamera.camera ) );
  // 	var effect = new THREE.ShaderPass( THREE.RGBShiftShader );
  // 	var effect = new THREE.ShaderPass( THREE.barrelDistortion );
  // 	effect.uniforms[ 'amount' ].value = 0.0015;
  // 	effect.renderToScreen = true;
  // 	theViewport.composer.addPass( effect );
  
  var theCamKeyBinds = new KeyboardInput();
  theCamKeyBinds.addKeyBind( 'w', null, null, function(){ theCamera.move( new THREE.Vector3( 0, 1, 0 ) ) }, null, null );
  theCamKeyBinds.addKeyBind( 'a', null, null, function(){ theCamera.move( new THREE.Vector3( -1, 0, 0 ) ) }, null, null );
  theCamKeyBinds.addKeyBind( 's', null, null, function(){ theCamera.move( new THREE.Vector3( 0, -1, 0 ) ) }, null, null );
  theCamKeyBinds.addKeyBind( 'd', null, null, function(){ theCamera.move( new THREE.Vector3( 1, 0, 0 ) ) }, null, null );
  
  theCamKeyBinds.addKeyBind( 'r', null, null, function(){ theCamera.move( new THREE.Vector3( 0, 0, 1 ) ) }, null, null );
  theCamKeyBinds.addKeyBind( 'f', null, null, function(){ theCamera.move( new THREE.Vector3( 0, 0, -1 ) ) }, null, null );
  
  theCamKeyBinds.addKeyBind( 'q', null, null, function(){ theCamera.rotate( new THREE.Vector3( 0, 0, 1 ) ) }, null, null );
  theCamKeyBinds.addKeyBind( 'e', null, null, function(){ theCamera.rotate( new THREE.Vector3( 0, 0, -1 ) ) }, null, null );
  
  theCamKeyBinds.addKeyBind( 'i', null, null, function(){ theCamera.rotate( new THREE.Vector3( 1, 0, 0 ) ) }, null, null );
  theCamKeyBinds.addKeyBind( 'j', null, null, function(){ theCamera.rotate( new THREE.Vector3( 0, 1, 0 ) ) }, null, null );
  theCamKeyBinds.addKeyBind( 'k', null, null, function(){ theCamera.rotate( new THREE.Vector3( -1, 0, 0 ) ) }, null, null );
  theCamKeyBinds.addKeyBind( 'l', null, null, function(){ theCamera.rotate( new THREE.Vector3( 0, -1, 0 ) ) }, null, null );
  
  theCamKeyBinds.addKeyBind( '/', function(){ console.log(theCamera.camera.position) }, null, null, null, null );
  theCamKeyBinds.addKeyBind( 'x', function(){ theCamera.resetToZero() }, null, null, null, null );
  
  theCamKeyBinds.addKeyBind( 'c', function(){
    theCamera.toggleMode();
    theCamera.targetRotationLock = false;
    theCamera.targetPositionLock = false;
  }, null, null, null, null );

  var thePlayerKeyBinds = new KeyboardInput();
  thePlayerKeyBinds.addKeyBind( 'w', null, null, function(){ thePlayer.walkForward() }, null, null );
  thePlayerKeyBinds.addKeyBind( 'a', null, null, function(){ thePlayer.walkLeft() }, null, null );
  thePlayerKeyBinds.addKeyBind( 's', null, null, function(){ thePlayer.walkBackward() }, null, null );
  thePlayerKeyBinds.addKeyBind( 'd', null, null, function(){ thePlayer.walkRight() }, null, null );
  
  thePlayerKeyBinds.addKeyBind( 'up', null, null, function(){ thePlayer.walkForward() }, null, null );
  thePlayerKeyBinds.addKeyBind( 'left', null, null, function(){ thePlayer.turnLeft() }, null, null );
  thePlayerKeyBinds.addKeyBind( 'down', null, null, function(){ thePlayer.walkBackward() }, null, null );
  thePlayerKeyBinds.addKeyBind( 'right', null, null, function(){ thePlayer.turnRight() }, null, null );
  
  thePlayerKeyBinds.addKeyBind( 'space', function(){ thePlayer.jump() }, null, null, null, null );
  thePlayerKeyBinds.addKeyBind( 'ctrl', function(){ thePlayer.crouch() }, null, null, null, null );
  
  thePlayerKeyBinds.addKeyBind( 'c', function(){ theCamera.toggleMode() }, null, null, null, null );
  
  thePlayerKeyBinds.addKeyBind( '1', function(){
    thePlayer.state.current.toolset.selectTool( 1 );
    UI[thePlayer.state.current.ui].updateButtons();
  }, null, null, null, null );
  
  thePlayerKeyBinds.addKeyBind( '2', function(){ 
    thePlayer.state.current.toolset.selectTool( 2 );
    UI[thePlayer.state.current.ui].updateButtons();
  }, null, null, null, null );
  
  thePlayerKeyBinds.addKeyBind( '3', function(){ 
    thePlayer.state.current.toolset.selectTool( 3 );
    UI[thePlayer.state.current.ui].updateButtons();
  }, null, null, null, null );
  
  thePlayerKeyBinds.addKeyBind( '4', function(){ 
    thePlayer.state.current.toolset.selectTool( 4 );
    UI[thePlayer.state.current.ui].updateButtons();
  }, null, null, null, null );
  
  thePlayerKeyBinds.addKeyBind( '5', function(){ 
    thePlayer.state.current.toolset.selectTool( 5 );
    UI[thePlayer.state.current.ui].updateButtons();
  }, null, null, null, null );
  
  thePlayerKeyBinds.addKeyBind( '6', function(){
    thePlayer.state.current.toolset.selectTool( 6 );
    UI[thePlayer.state.current.ui].updateButtons();
  }, null, null, null, null );
  
  thePlayerKeyBinds.addKeyBind( '7', function(){
    thePlayer.state.current.toolset.selectTool( 7 );
    UI[thePlayer.state.current.ui].updateButtons();
  }, null, null, null, null );
  
  thePlayerKeyBinds.addKeyBind( 'q', function(){
    thePlayer.state.current.goToPreviousState();
    UI[thePlayer.state.current.ui].updateButtons();
  }, null, null, null, null );
  
  var theMouseBinds = new MouseInput();
  theMouseBinds.disableContextMenu = true;
  
  // theCamera.targetRotationLock = false;
  // theCamera.targetPositionLock = false;
  // theMouseBinds.addPointerBind( function( event ){ theCamera.mouseLook( event ) } );
  // theInputs = new Inputs( theCamKeyBinds, theMouseBinds );
  
  theMouseBinds.addButtonBind( 0, 
    function(){ thePlayer.state.current.toolset.onPrimaryDown() },
    function(){ thePlayer.state.current.toolset.onPrimaryUp() },
    function(){ thePlayer.state.current.toolset.whilePrimaryDown() },
    function(){ thePlayer.state.current.toolset.whilePrimaryUp() },
    function(){ thePlayer.state.current.toolset.onUpdate() } );
  theMouseBinds.addButtonBind( 1, 
    function(){ thePlayer.state.current.toolset.onTertiaryDown() },
    function(){ thePlayer.state.current.toolset.onTertiaryUp() },
    function(){ thePlayer.state.current.toolset.whileTertiaryDown() },
    function(){ thePlayer.state.current.toolset.whileTertiaryUp() },
    null );
  theMouseBinds.addButtonBind( 2, 
    function(){ thePlayer.state.current.toolset.onSecondaryDown() },
    function(){ thePlayer.state.current.toolset.onSecondaryUp() },
    function(){ thePlayer.state.current.toolset.whileSecondaryDown() },
    function(){ thePlayer.state.current.toolset.whileSecondaryUp() },
    null );
    
  theMouseBinds.addPointerBind( function( event ) { thePlayer.mouseLook( event ) } );
  
  theMouseBinds.addWheelBind( function( event ) {
    thePlayer.state.current.toolset.scrollTools( event );
    UI[thePlayer.state.current.ui].updateButtons();
  } );
  
  theInputs = new Inputs( thePlayerKeyBinds, theMouseBinds );
  
  // Request pointer lock and go fullscreen
  // document.onclick = function(){ theMouseBinds.requestPointerLock( theViewport.renderer.domElement ) };
  // document.documentElement.webkitRequestFullscreen();
  
  // As soon as everything is ready, we can start the game
  theTimer.start();
  theState.setState( runningState );
};

// Paused state
var pausedState = new State();

// Game running
var runningState = new State();
runningState.onEnter = function() {
  theInputs.mouse.requestPointerLock( theViewport.renderer.domElement );
  theOverlay.elements.fpsDisplay.toggle( true );
  theOverlay.elements.bottomBar.toggle( true );
  UI[thePlayer.state.current.ui].updateButtons();
  this.update();
};
runningState.update = function() {
  theAnimationRequest = requestAnimationFrame( theState.update );

  theTimeDelta = theTimer.getDelta();

  theTimeDeltaAverage = theTimeDeltaAverage * 0.95 + theTimeDelta * 0.05;
  theFrameRate = ( 1 / theTimeDeltaAverage ).toFixed(0);
  theFrameCount++;
  
  theInputs.update();
  theWorld.update();
  theCamera.update();
  theOverlay.update();
  
  // theGamepad = navigator.getGamepads();
  // console.log( theGamepad[0].axes[0] );
  
  theViewport.renderer.render( theScene, theCamera.camera );
  // theViewport.composer.render();
};
runningState.onExit = function() {
  theOverlay.elements.fpsDisplay.toggle( false );
  theOverlay.elements.bottomBar.toggle( false );
  theInputs.mouse.exitPointerLock();
  cancelAnimationFrame( theAnimationRequest );
};
  
var theState = new State( startState );
// theState.setState( initState ); // Straight to gameplay