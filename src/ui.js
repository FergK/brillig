/* global theState pausedState theViewport theTimeDelta theTimeDeltaAverage theFrameRate theFrameCount theConfig UI*/

// =============================================================================
// UI ELEMENT ==================================================================
// =============================================================================

function UIElement( id, parentID ) {

  // console.log( "Creating UIElement for " + id );

  this.enabled = false;
  this.id = id;
  this.parentID = parentID;

  var selector = document.querySelector( 'link[href="ui/' + id + '.html"]' );
  var content = selector.import;

  this.html = content.querySelector( '.toImport' );
  
  this.jquery = $( this.html );
  
  $( "#" + this.parentID ).append( this.jquery );
  this.jquery.hide();

}
UIElement.prototype.constructor = UIElement;

UIElement.prototype.toggle = function( toggle ) {
  this.enabled = ( toggle !== undefined ) ? toggle : !this.enabled;
  if ( this.enabled ) {
    this.onEnable();
  } else {
    this.onDisable();
  }
};

UIElement.prototype.onEnable = function() {
  this.jquery.show();
};

UIElement.prototype.onDisable = function() {
  this.jquery.hide();
};

// =============================================================================
// OVERLAY =====================================================================
// =============================================================================

function Overlay() {
  
  this.elements = {};
  
  this.elements.bottomBar = new UIElement( 'bottomBar', 'container' );
  
  this.elements.builderBar = new UIElement( 'builderBar', 'container' );
  
  this.elements.equipmentBar = new UIElement( 'equipmentBar', 'container' );
  
  this.elements.fpsDisplay = new UIElement( 'fpsDisplay', 'container' );
  this.elements.fpsDisplay.update = function () { 
    if ( this.enabled == true ) {
      // this.jquery.html( theFrameRate + "<br>" + theTimeDeltaAverage.toFixed(5) + "<br>" + theTimeDelta.toFixed(5) );
      this.jquery.html( theFrameRate );
    }
  };
  
  this.elements.optionsBox = new UIElement( 'optionsBox', 'container' );

  this.elements.optionsBox.onEnable = function() {
    UI["optionsBox"].onEnable();
    this.jquery.show();
  };
  
  
  this.elements.startBox = new UIElement( 'startBox', 'container' );
  
  this.elements.titleBar = new UIElement( 'titleBar', 'container' );
  
}

Overlay.prototype.update = function() {
  if ( this.elements.fpsDisplay.update !== undefined ) {
    this.elements.fpsDisplay.update();
  }
};


// Visibility / Pausing ========================================================

document.addEventListener( 'visibilitychange', pauseOnHidden, false );
function pauseOnHidden() {
  if ( document.hidden ) {
    theState.setState( pausedState );
  } else {
    theState.goToPreviousState();
  }
}