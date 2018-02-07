/* global THREE CANNON */
"use strict";

// =============================================================================
// TOOLSET =====================================================================
// =============================================================================

function Toolset() {
  
  // Options ===================================================================
  
  this.equippedTool = 0;
  
  // Tools =====================================================================
  
  this.tools = [];

  this.tools[0] = nullTool;
  
  var nullTool = {};
  nullTool.name = "null";
  nullTool.icon = "";
  
}
Toolset.prototype.constructor = Toolset;


// Controls ====================================================================
Toolset.prototype.onPrimaryDown = function () { 
  if ( this.tools[this.equippedTool].onPrimaryDown !== undefined ) { this.tools[this.equippedTool].onPrimaryDown() } };
Toolset.prototype.onPrimaryUp = function () {
  if ( this.tools[this.equippedTool].onPrimaryUp !== undefined ) { this.tools[this.equippedTool].onPrimaryUp() } };
Toolset.prototype.whilePrimaryDown = function () {
  if ( this.tools[this.equippedTool].whilePrimaryDown !== undefined ) { this.tools[this.equippedTool].whilePrimaryDown() } };
Toolset.prototype.whilePrimaryUp = function () { 
  if ( this.tools[this.equippedTool].whilePrimaryUp !== undefined ) { this.tools[this.equippedTool].whilePrimaryUp() } };

Toolset.prototype.onSecondaryDown = function () {
  if ( this.tools[this.equippedTool].onSecondaryDown !== undefined ) { this.tools[this.equippedTool].onSecondaryDown() } };
Toolset.prototype.onSecondaryUp = function () { 
  if ( this.tools[this.equippedTool].onSecondaryUp !== undefined ) { this.tools[this.equippedTool].onSecondaryUp() } };
Toolset.prototype.whileSecondaryDown = function () {
  if ( this.tools[this.equippedTool].whileSecondaryDown !== undefined ) { this.tools[this.equippedTool].whileSecondaryDown() } };
Toolset.prototype.whileSecondaryUp = function () { 
  if ( this.tools[this.equippedTool].whileSecondaryUp !== undefined ) { this.tools[this.equippedTool].whileSecondaryUp() } };

Toolset.prototype.onTertiaryDown = function () {
  if ( this.tools[this.equippedTool].onTertiaryDown !== undefined ) { this.tools[this.equippedTool].onTertiaryDown() } };
Toolset.prototype.onTertiaryUp = function () { 
  if ( this.tools[this.equippedTool].onTertiaryUp !== undefined ) { this.tools[this.equippedTool].onTertiaryUp() } };
Toolset.prototype.whileTertiaryDown = function () {
  if ( this.tools[this.equippedTool].whileTertiaryDown !== undefined ) { this.tools[this.equippedTool].whileTertiaryDown() } };
Toolset.prototype.whileTertiaryUp = function () { 
  if ( this.tools[this.equippedTool].whileTertiaryUp !== undefined ) { this.tools[this.equippedTool].whileTertiaryUp() } };
  
Toolset.prototype.onEnter = function () { 
  if ( this.tools[this.equippedTool].onEnter !== undefined ) { this.tools[this.equippedTool].onEnter() } };
Toolset.prototype.onUpdate = function () { 
  if ( this.tools[this.equippedTool].onUpdate !== undefined ) { this.tools[this.equippedTool].onUpdate() } };
Toolset.prototype.onExit = function () { 
  if ( this.tools[this.equippedTool].onExit !== undefined ) { this.tools[this.equippedTool].onExit() } };
  
  
  
// Tool Selection ==============================================================
  
Toolset.prototype.selectTool = function ( toolNum ) {
  
  if ( toolNum === this.equippedTool ) {
    return false;
  }
  
  var newTool;
  
  if ( toolNum <= 0 ) {
    newTool = this.tools.length - 1;
  } else if ( toolNum >= this.tools.length ) {
    newTool = 1;
  } else {
    newTool = toolNum;
  }
  
  this.onExit();
  this.equippedTool = newTool;
  this.onEnter();
  
};

Toolset.prototype.prevTool = function () { this.selectTool( this.equippedTool - 1 ) };
Toolset.prototype.nextTool = function () { this.selectTool( this.equippedTool + 1 ) };

Toolset.prototype.scrollTools = function ( event ) {
  // Takes a wheel event as a parameter
  var scroll = ( event.wheelDeltaY > 0 ) ? -1 : 1;
  this.selectTool( this.equippedTool + scroll );
};
