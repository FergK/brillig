/* global THREE */

// =============================================================================
// CONFIG =======================================================================
// =============================================================================
// Class for saving and restoring configuration values

var Config = function() {
  
  this.resetToDefaults();

};
Config.prototype.constructor = Config;

Config.prototype.resetToDefaults = function() {
  this.mouse = {};
  this.mouse.lookSensitivity = 1;
  
  this.gameplay = {};
  this.gameplay.FOV = 65;
  
  this.video = {};
  this.video.enableAntiAliasing = true;
  this.video.resolutionModifier = 1; // Anything larger than 2 breaks WebGL, due to a max canvas width of 4096
  this.video.needsRestart = false;
};

Config.prototype.saveToLocalStorage = function() {
  // console.log('Saving config to local storage');
  localStorage['theConfig'] = JSON.stringify( this );
};

Config.prototype.loadFromLocalStorage = function() {
  // console.log('Loading config from local storage');
  
  if (
    ( localStorage['theConfig'] === null ) ||
    ( localStorage['theConfig'] === undefined )
  ) {
    // console.log('No config found');
    return;
  }
  
  var result = JSON.parse( localStorage['theConfig'] );
  // console.log('Config loaded:');
  // console.log( result );
  this.mouse = result.mouse;
  this.gameplay = result.gameplay;
  this.video = result.video;
};