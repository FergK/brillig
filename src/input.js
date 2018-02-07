// =============================================================================
// KEYCODES ====================================================================
// =============================================================================
// An index of all the keycodes usable for input

var keycodes = [];

keycodes.push( [ 8,     'backspace' ] );
keycodes.push( [ 9,     'tab' ] );

keycodes.push( [ 13,    'enter' ] );

keycodes.push( [ 16,    "shift" ] );
keycodes.push( [ 17,    "ctrl" ] );
keycodes.push( [ 18,    "alt" ] );

keycodes.push( [ 20,    "capslock" ] );

keycodes.push( [ 27,    "escape" ] );

keycodes.push( [ 32,    "space" ] );

keycodes.push( [ 33,    "pageup" ] );
keycodes.push( [ 34,    "pagedown" ] );
keycodes.push( [ 35,    "end" ] );
keycodes.push( [ 36,    "home" ] );

keycodes.push( [ 37,    "left" ] );
keycodes.push( [ 38,    "up" ] );
keycodes.push( [ 39,    "right" ] );
keycodes.push( [ 40,    "down" ] );

keycodes.push( [ 45,    "insert" ] );
keycodes.push( [ 46,    "delete" ] );

keycodes.push( [ 48,    '0' ] );
keycodes.push( [ 49,    '1' ] );
keycodes.push( [ 50,    '2' ] );
keycodes.push( [ 51,    '3' ] );
keycodes.push( [ 52,    '4' ] );
keycodes.push( [ 53,    '5' ] );
keycodes.push( [ 54,    '6' ] );
keycodes.push( [ 55,    '7' ] );
keycodes.push( [ 56,    '8' ] );
keycodes.push( [ 57,    '9' ] );

keycodes.push( [ 65,    'a' ] );
keycodes.push( [ 66,    'b' ] );
keycodes.push( [ 67,    'c' ] );
keycodes.push( [ 68,    'd' ] );
keycodes.push( [ 69,    'e' ] );
keycodes.push( [ 70,    'f' ] );
keycodes.push( [ 71,    'g' ] );
keycodes.push( [ 72,    'h' ] );
keycodes.push( [ 73,    'i' ] );
keycodes.push( [ 74,    'j' ] );
keycodes.push( [ 75,    'k' ] );
keycodes.push( [ 76,    'l' ] );
keycodes.push( [ 77,    'm' ] );
keycodes.push( [ 78,    'n' ] );
keycodes.push( [ 79,    'o' ] );
keycodes.push( [ 80,    'p' ] );
keycodes.push( [ 81,    'q' ] );
keycodes.push( [ 82,    'r' ] );
keycodes.push( [ 83,    's' ] );
keycodes.push( [ 84,    't' ] );
keycodes.push( [ 85,    'u' ] );
keycodes.push( [ 86,    'v' ] );
keycodes.push( [ 87,    'w' ] );
keycodes.push( [ 88,    'x' ] );
keycodes.push( [ 89,    'y' ] );
keycodes.push( [ 90,    'z' ] );

keycodes.push( [ 91,    'meta' ] );

keycodes.push( [ 112,   'f1' ] );
keycodes.push( [ 113,   'f2' ] );
keycodes.push( [ 114,   'f3' ] );
keycodes.push( [ 115,   'f4' ] );
keycodes.push( [ 116,   'f5' ] );
keycodes.push( [ 117,   'f6' ] );
keycodes.push( [ 118,   'f7' ] );
keycodes.push( [ 119,   'f8' ] );
keycodes.push( [ 120,   'f9' ] );
keycodes.push( [ 121,   'f10' ] );
keycodes.push( [ 122,   'f11' ] );
keycodes.push( [ 123,   'f12' ] );

keycodes.push( [ 186,   ";" ] );
keycodes.push( [ 187,   "=" ] );
keycodes.push( [ 188,   "," ] );
keycodes.push( [ 189,   "-" ] );
keycodes.push( [ 190,   "." ] );
keycodes.push( [ 191,   "/" ] );
keycodes.push( [ 192,   "`" ] );

keycodes.push( [ 219,   "[" ] );
keycodes.push( [ 220,   "\\" ] );
keycodes.push( [ 221,   "]" ] );
keycodes.push( [ 222,   "\'" ] );

// =============================================================================
// CONTROLS ====================================================================
// =============================================================================
// Master class for all user input: keyboard, mouse, and hopefully gamepad

function Inputs( keyboard, mouse ) {

  this.keyboard = ( keyboard !== undefined ) ? keyboard : null;
  this.mouse = ( mouse !== undefined ) ? mouse : null;
  
  this.setupEventHandlers();

}
Inputs.prototype.constructor = Inputs;

// update ======================================================================
// Called each frame.
Inputs.prototype.update = function() {

  if ( this.keyboard !== null ) { this.keyboard.update(); }
  if ( this.mouse !== null ) { this.mouse.update(); }

};

// setupEventHandlers ==========================================================
// Get the events from the browser
Inputs.prototype.setupEventHandlers = function() {

  // By default when you use 'this' with an event, 'this' is the document, not
  // the object, so the using self is a work around so that 'this' will actually
  // refer to this object, not the document
  var self = this;
  if ( this.keyboard !== null ) {
    document.addEventListener( 'keydown',
      function ( event ) { self.keyboard.onKeyDown( event ); },
      true );
    document.addEventListener( 'keyup', 
      function ( event ) { self.keyboard.onKeyUp( event ); },
      true );
    document.addEventListener( 'visibilitychange',
      function ( event ) { self.keyboard.onChangeVisibility(); },
      false );
  }

  if ( this.mouse !== null ) {
    document.addEventListener( 'mousedown',
      function ( event ) { 
        event.preventDefault();
        self.mouse.onMouseDown( event );
      },
      false
    );
    document.addEventListener( 'mouseup', function ( event ) { self.mouse.onMouseUp( event ); }, false );
    document.addEventListener( 'mousemove', function ( event ) { self.mouse.onMouseMove( event ); }, false );
    document.addEventListener( 'wheel', function ( event ) { self.mouse.onMouseWheel( event ); }, false );
      
    document.addEventListener( 'pointerlockchange', function ( event ) { self.mouse.onChangePointerLock( event ); }, false );
      
    if ( this.mouse.disableContextMenu ) {
      document.addEventListener( 'contextmenu', 
        function ( event ) { event.preventDefault(); },
        true
      );
    }
    
  }

};

// clearEventHandlers ==========================================================
// Disable getting the events from the browser
Inputs.prototype.clearEventHandlers = function() {
  // document.removeEventListener( 'keydown', this.keyboard.onKeyDown, true );
  // document.removeEventListener( 'keyup',  this.keyboard.onKeyUp, true );
  // document.removeEventListener( 'visibilitychange', onChangeVisibility, false );
  // document.removeEventListener( 'pointerlockchange', onChangePointerLock, false );
  // document.removeEventListener( 'mousemove', onMouseMove, false );
};


// =============================================================================
// KeyboardInput ===============================================================
// =============================================================================

function KeyboardInput() {

  this.keys = []; // Array of keycodes. Set to true if pressed.
  this.keyBinds = []; // Array of KeyBind objects.
  
}
KeyboardInput.prototype.constructor = KeyboardInput;

// update ======================================================================
// Called each frame. Only necessary for eachframe, whileup, and whiledown bindings
KeyboardInput.prototype.update = function() {

  for ( var i = 0; i < this.keyBinds.length; i++ ) {
    this.keyBinds[i].update( this.keys );
  }

};

// onKeyDown ===================================================================
// Triggered on any key being pressed
KeyboardInput.prototype.onKeyDown = function( event ) {
  
  // This stops the browser from performing any action when this key is pressed
  // if you want certain actions to still occur, exclude them here.
  if (
    ( event.keyCode === 16 ) ||
    ( event.keyCode === 17 ) ||
    ( event.keyCode === 18 ) ||
    ( event.keyCode === 27 ) ||
    ( event.keyCode === 74 ) ||
    ( event.keyCode === 116 ) ||
    ( event.keyCode === 122 ) 
  ) {} else {
    event.preventDefault();
  }
  
  this.keys[event.keyCode] = true;
  
  for ( var i = 0; i < this.keyBinds.length; i++ ) {
    // See if each of the keyBinds can use this event
    this.keyBinds[i].checkKeyDown( this.keys );
  }
   
};

// onKeyUp =====================================================================
// Triggered on any key being released
KeyboardInput.prototype.onKeyUp = function( event ) {
  
  this.keys[event.keyCode] = false;
  
  for ( var i = 0; i < this.keyBinds.length; i++ ) {
    this.keyBinds[i].checkKeyUp( this.keys );
  }
  
};

// addKeyBind ==================================================================
// Links a set of functions to a specific key
KeyboardInput.prototype.addKeyBind = function( keyName, onDown, onUp, whileDown, whileUp, eachFrame ) {
  
  this.keyBinds[this.keyBinds.length] = new KeyBind( keyName, onDown, onUp, whileDown, whileUp, eachFrame );
  return this.keyBinds.length;
  
};

// clearKeyBind ==================================================================
// Removes any bound functions from a specific key
KeyboardInput.prototype.clearKeyBind = function( keyName ) {

  for ( var i = 0; i < this.keyBinds.length; i++ ) {
    if ( this.keyBinds[i].keyName === keyName ) {
      this.keyBinds.splice( i, 1 );
      // console.log( "Removed bind for key '" + keyName + "'" );
      return true;
    }
  }
  
  console.log( "Could not remove bind for key '" + keyName + "'" );
  return false;
  
};

// onChangeVisibility ==========================================================
// Triggered by a change in focus to browser window.
// Loops through each key in the this.keys array and runs the onKeyUp function
// for each key that is currently pressed. This prevents the annoying situation
// where if the window loses focus while a key is held down it stays "held down"
// in the code until the actual key is pressed again.
KeyboardInput.prototype.onChangeVisibility = function( event ) {
  
  if ( !document.hidden ) { return; } // Didn't lose focus, don't do anything
  
  var self = this;
  
  this.keys.forEach( 
    function( value, index, array ) { 
      if ( value !== false ) { 
        this.onKeyUp( { "keyCode":index } );
      }
    },
    self
  );
  
};

// =============================================================================
// KEYBIND =====================================================================
// =============================================================================

function KeyBind( keyName, onDown, onUp, whileDown, whileUp, eachFrame ) {
  
  this.keyName = keyName;
  this.keyCode = null;
  
  for ( var j = 0; j < keycodes.length; j++ ) {
    if ( keycodes[j][1] == keyName ) {
      this.keyCode = keycodes[j][0];
    }
  }
  
  if ( this.keyCode === null ) {
    console.log( "Key named '" + keyName + "' not found." );
  }
  
  this.onDown = ( onDown !== undefined ) ? onDown : null;
  this.onUp =  ( onUp !== undefined ) ? onUp : null;
  this.whileDown =  ( whileDown !== undefined ) ? whileDown : null;
  this.whileUp =  ( whileUp !== undefined ) ? whileUp : null;
  this.eachFrame =  ( eachFrame !== undefined ) ? eachFrame : null;
  
  this.keyRepeated = false;
  
} // END Binding class
KeyBind.prototype.constructor = KeyBind;

// update ======================================================================
// Called each frame. Checks to see if it's inputs are met and if so, calls the
// appropriate functions.
KeyBind.prototype.update = function( keys ) {
  // console.log( this.keyName + " updating" );
  
  if ( this.eachFrame !== null ) {
    // console.log( this.keyName + " eachFrame" );
    this.eachFrame();
  }
  
  if ( this.whileDown !== null ) {
    if ( ( keys[this.keyCode] !== false ) && ( keys[this.keyCode] !== undefined ) ) {
      // console.log( this.keyName + " whileDown" );
      this.whileDown();
    }
  }
  
  if ( this.whileUp !== null ) {
    if ( ( keys[this.keyCode] === false ) || ( keys[this.keyCode] === undefined ) ) {
      // console.log( this.keyName + " whileUp" );
      this.whileUp();
    }
  }
  
  return;
};

// checkKeyDown ================================================================
// Called on the keyDown event. Checks to see if it's inputs are met and if so,
// calls the appropriate functions.
KeyBind.prototype.checkKeyDown = function( keys ) {
  
  if ( ( keys[this.keyCode] !== false ) && ( keys[this.keyCode] !== undefined ) ) {
    if ( this.onDown !== null ) { // A function must be assigned to onDown
      if ( this.keyRepeated === false ) { // Only trigger on the first press
        // console.log( this.keyName + " onDown" );
        this.onDown();
      }
    }
    this.keyRepeated = true; // This key is probably being held down, don't repeat the onDown function
  } 
  
};

// checkKeyUp ==================================================================
// Called on the keyUp event. Checks to see if it's inputs are met and if so,
// calls the appropriate functions.
KeyBind.prototype.checkKeyUp = function( keys ) {
  
  if ( ( keys[this.keyCode] !== undefined ) && ( keys[this.keyCode] !== true ) ) {
    if ( this.keyRepeated === true ) {
      if ( this.onUp !== null ) { // A function must be assigned to onUp
        //console.log( this.keyName + " onUp" );
        this.onUp();
      }
    }
    this.keyRepeated = false; // Reset this variable for the next time the key is pressed
  } 
  
};

// =============================================================================
// MouseInput ==================================================================
// =============================================================================

function MouseInput() {
  
  this.buttons = []; // Array of buttons. Set to true if pressed.
  this.buttonBinds = []; // Array of buttonBinds objects.

  this.moveBind = null;
  this.pointerBind = null;
  this.wheelBind = null;
  
  this.pointerLock = false;
  this.pointerLockElement = null;

  this.disableContextMenu = false;
  
  this.sensitivity = 1;
  
}
MouseInput.prototype.constructor = MouseInput;

// update ======================================================================
// Called each frame. Only necessary for eachframe, whileup, and whiledown bindings
MouseInput.prototype.update = function() {

  for ( var i = 0; i < this.buttonBinds.length; i++ ) {
    this.buttonBinds[i].update( this.buttons );
  }

};

// onMouseDown =================================================================
// Triggered on any mouse button being pressed
MouseInput.prototype.onMouseDown = function( event ) {
  
  event.preventDefault();
  
  this.buttons[event.button] = true;
  
  for ( var i = 0; i < this.buttonBinds.length; i++ ) {
    this.buttonBinds[i].checkButtonDown( this.buttons );
  }
   
};

// onMouseUp ===================================================================
// Triggered on any mouse button being released
MouseInput.prototype.onMouseUp = function( event ) {
  
  this.buttons[event.button] = false;
  
  for ( var i = 0; i < this.buttonBinds.length; i++ ) {
    this.buttonBinds[i].checkButtonUp( this.buttons );
  }
  
};

// onMouseMove =================================================================
MouseInput.prototype.onMouseMove = function( event ) {
  
  if ( this.pointerLock && ( this.pointerBind !== null ) ) {
    this.pointerBind( event );
  } else if ( this.moveBind !== null ) {
    this.moveBind( event );
  }
  
};

// onMouseWheel ================================================================
MouseInput.prototype.onMouseWheel = function( event ) {
  
  if ( this.wheelBind !== null ) {
    this.wheelBind( event );
  }
  
};


// addButtonBind ===============================================================
MouseInput.prototype.addButtonBind = function( button, onDown, onUp, whileDown, whileUp, eachFrame ) {
  
  this.buttonBinds[this.buttonBinds.length] = new MouseBind( button, onDown, onUp, whileDown, whileUp, eachFrame );
  return this.buttonBinds.length;
  
};

// clearButtonBind =============================================================
MouseInput.prototype.clearButtonBind = function( button ) {

  for ( var i = 0; i < this.buttonBinds.length; i++ ) {
    if ( this.buttonBinds[i].button === button ) {
      this.buttonBinds.splice( i, 1 );
      // console.log( "Removed bind for mouse button '" + button + "'" );
      return true;
    }
  }
  
  console.log( "Could not remove bind for mouse button '" + button + "'" );
  return false;
  
};

// addMoveBind =================================================================
MouseInput.prototype.addMoveBind = function( onMove ) {
  
  this.moveBind = onMove;

};

// addPointerBind ==============================================================
MouseInput.prototype.addPointerBind = function( onMove ) {
  
  this.pointerBind = onMove;

};

// addWheelBind ================================================================
MouseInput.prototype.addWheelBind = function( onMove ) {
  
  this.wheelBind = onMove;

};

// requestPointerLock  =========================================================
MouseInput.prototype.requestPointerLock = function( element ) {
  
  this.pointerLockElement = element;
  element.requestPointerLock();

};

// exitPointerLock  ============================================================
MouseInput.prototype.exitPointerLock = function() {
  
  document.exitPointerLock();
  
};

// onChangePointerLock =========================================================
MouseInput.prototype.onChangePointerLock = function( event ) {
  
  if ( document.pointerLockElement === this.pointerLockElement ) {
    this.pointerLock = true;
  } else {
    this.pointerLockElement = null;
    this.pointerLock = false;
  }
  
};

// =============================================================================
// MOUSEBIND ===================================================================
// =============================================================================

function MouseBind( button, onDown, onUp, whileDown, whileUp, eachFrame ) {
  
  this.button = button;
  
  this.onDown = ( onDown !== undefined ) ? onDown : null;
  this.onUp =  ( onUp !== undefined ) ? onUp : null;
  this.whileDown =  ( whileDown !== undefined ) ? whileDown : null;
  this.whileUp =  ( whileUp !== undefined ) ? whileUp : null;
  this.eachFrame =  ( eachFrame !== undefined ) ? eachFrame : null;
  
  this.buttonRepeated = false;
  
}
MouseBind.prototype.constructor = MouseBind;

// update ======================================================================
// Called each frame. Checks to see if it's inputs are met and if so, calls the
// appropriate functions.
MouseBind.prototype.update = function( buttons ) {
  // console.log( "mouse button " + this.button + " updating" );
  
  if ( this.eachFrame !== null ) {
    // console.log( "mouse button " + this.button + " eachFrame" );
    this.eachFrame();
  }
  
  if ( this.whileDown !== null ) {
    if ( ( buttons[this.button] !== false ) && ( buttons[this.button] !== undefined ) ) {
      // console.log( "mouse button " + this.button + " whileDown" );
      this.whileDown();
    }
  }
  
  if ( this.whileUp !== null ) {
    if ( ( buttons[this.button] === false ) || ( buttons[this.button] === undefined ) ) {
      // console.log( "mouse button " + this.button + " whileUp" );
      this.whileUp();
    }
  }
  
  return;
};

// checkButtonDown =============================================================
MouseBind.prototype.checkButtonDown = function( buttons ) {
  
  if ( ( buttons[this.button] !== false ) && ( buttons[this.button] !== undefined ) ) {
    if ( this.onDown !== null ) { // A function must be assigned to onDown
      if ( this.buttonRepeated === false ) { // Only trigger on the first press
        // console.log( "mouse button " + this.button + " onDown" );
        this.onDown();
      }
    }
    this.buttonRepeated = true; // This button is probably being held down, don't repeat the onDown function
  } 
  
};

// checkButtonUp ===============================================================
MouseBind.prototype.checkButtonUp = function( buttons ) {
  
  if ( ( buttons[this.button] !== undefined ) && ( buttons[this.button] !== true ) ) {
    if ( this.buttonRepeated === true ) {
      if ( this.onUp !== null ) { // A function must be assigned to onUp
        //console.log( "mouse button " + this.button + " onUp" );
        this.onUp();
      }
    }
    this.buttonRepeated = false; // Reset this variable for the next time the button is pressed
  } 
  
};