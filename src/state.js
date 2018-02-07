/* global THREE */

// =============================================================================
// STATE =======================================================================
// =============================================================================

var State = function ( newState ) {
  
  this.state = null;
  this.previousState = null;
  this.onEnter = function () {};
  this.update = function () {};
  this.onExit = function () {};
  
  if ( newState !== undefined ) {
    this.setState( newState );
  }
  
};
State.prototype.constructor = State;

State.prototype.setState = function( newState ) {
  
  // If we are already in the state we are trying to switch to, do nothing
  if( this.state === newState ) { return; }
  
  this.previousState = this.state;
  this.onExit();
  this.state = newState;
  this.onEnter = newState.onEnter;
  this.update = newState.update;
  this.onExit = newState.onExit;
  this.onEnter();
};

State.prototype.goToPreviousState = function() {
  this.setState( this.previousState );
};

// =============================================================================
// PLAYERSTATE =================================================================
// =============================================================================

var PlayerState = function ( newState ) {
  
  this.state = null;
  this.previousState = null;
  this.onEnter = function () {};
  this.update = function () {};
  this.onExit = function () {};
  
  this.toolset = null;
  this.ui = "";
  
  if ( newState !== undefined ) {
    this.setState( newState );
  }
  
};
PlayerState.prototype.constructor = PlayerState;

PlayerState.prototype.setState = function( newState ) {
  
  // If we are already in the state we are trying to switch to, do nothing
  if( this.state === newState ) { return; }
  
  this.previousState = this.state;
  this.onExit();
  
  this.state = newState;
  this.onEnter = newState.onEnter;
  this.update = newState.update;
  this.onExit = newState.onExit;
  
  this.toolset = newState.toolset;
  this.ui = newState.ui;
  
  this.onEnter();
};

PlayerState.prototype.goToPreviousState = function() {
  this.setState( this.previousState );
};