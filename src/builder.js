/* global THREE CANNON X_AXIS Y_AXIS Z_AXIS Toolset self thePlayer theWorld Entity StaticEntity Wall WallInset*/
"use strict";

// =============================================================================
// BUILDER ===================================================================
// =============================================================================

function Builder() {
    
  var self = this;
  
  // Options ===================================================================
  
  this.equippedTool = 2;
  
  this.showCursor = true;
  this.showCursorSnap = true;
  
  this.gridSnap = true;
  this.gridSize = 0.5; // Meters
  this.angleSnap = true;

  
  // Tool Objects ==============================================================
  
  this.removeTool = {};
  this.removeTool.name = "Remove";
  this.removeTool.icon = "remove";
  this.removeTool.onPrimaryDown = function () { self.removeEntity() };
  this.removeTool.onTertiaryDown = function () { self.removeEntity() };
  
  this.wallTool = {};
  this.wallTool.name = "Wall";
  this.wallTool.icon = "stop";
  this.wallTool.onEnter = function () { self.setupWall() };
  this.wallTool.onPrimaryDown = function () { self.startWall() };
  this.wallTool.onPrimaryUp = function () { self.finishWall() };
  this.wallTool.whilePrimaryDown = function () { self.updateWall() };
  this.wallTool.onTertiaryDown = function () { self.removeEntity() };
  this.wallTool.onExit = function () { self.clearWall() };
  this.wallTool.startPoint = null;
  this.wallTool.finishPoint = null;
  this.wallTool.preview = null;
  // this.wallTool.depth = 0.1;
  // this.wallTool.height = 2.5;
  this.wallTool.depth = 0.1;
  this.wallTool.height = 3;
  this.wallTool.color = 0xBBBB88;
  this.wallTool.previewOpacity = 0.5;
  this.wallTool.previewFailColor = 0xFF0000;
  
  this.slabTool = {};
  this.slabTool.name = "Slab";
  this.slabTool.icon = "table";
  this.slabTool.onEnter = function(){ self.setupSlab() };
  this.slabTool.onPrimaryDown = function () { self.startSlab() };
  this.slabTool.onPrimaryUp = function () { self.finishSlab() };
  this.slabTool.whilePrimaryDown = function () { self.updateSlab() };
  this.slabTool.onTertiaryDown = function () { self.removeEntity() };
  this.slabTool.onExit = function () { self.clearSlab() };
  this.slabTool.startPoint = null;
  this.slabTool.finishPoint = null;
  this.slabTool.preview = null;
  this.slabTool.height = 0.1;
  this.slabTool.heightOffset = -0.09;
  this.slabTool.color = 0xBBBB88;
  this.slabTool.previewOpacity = 0.5;
  this.slabTool.previewFailColor = 0xFF0000;
  
  this.doorTool = {};
  this.doorTool.name = "Door";
  this.doorTool.icon = "trello";
  this.doorTool.onEnter = function () {
    self.setupDoor();
    self.showCursorSnap = false;
    self.clearCursors();
  };
  this.doorTool.onPrimaryDown = function () { self.finishDoor() };
  this.doorTool.onUpdate = function () { self.updateDoor() };
  this.doorTool.onTertiaryDown = function () { self.removeEntity() };
  this.doorTool.onExit = function () {
    self.clearDoor();
    self.showCursorSnap = true;
  };
  this.doorTool.position = null;
  this.doorTool.rotation = null;
  this.doorTool.preview = null;
  this.doorTool.size = new THREE.Vector3( 1.2, 0.15, 2 ); // Width, depth, height
  // this.doorTool.size = new THREE.Vector3( 1, 0.15, 1.25 ); // Window size
  // this.doorTool.size = new THREE.Vector3( 0.75, 0.15, 0.75 );
  this.doorTool.frameWidth = 0.1;
  this.doorTool.thresholdOffset = 0.02;
  this.doorTool.color = 0xBBBB99;
  this.doorTool.previewOpacity = 0.5;
  this.doorTool.previewColor = 0x00FF00;
  
  this.cubeTool = {};
  this.cubeTool.name = "Cube";
  this.cubeTool.icon = "cube";
  this.cubeTool.onPrimaryDown = function(){ self.placeStaticEntity( {
    type: 'box',
    size: new THREE.Vector3( 1, 1, 1 )
  } ) };
  this.cubeTool.onTertiaryDown = function(){ self.removeEntity() };
  
  this.cylinderTool = {};
  this.cylinderTool.name = "Cylinder";
  this.cylinderTool.icon = "database";
  this.cylinderTool.onPrimaryDown = function(){ self.placeStaticEntity( {
    type: 'cylinder',
    radiusTop: 0.5,
    radiusBottom: 0.5,
    height: 3,
    radiusSegments: 16
  } ) };
  this.cylinderTool.onTertiaryDown = function(){ self.removeEntity() };
  
  this.sphereTool = {};
  this.sphereTool.name = "Sphere";
  this.sphereTool.icon = "circle-o";
  this.sphereTool.onPrimaryDown = function(){ self.placeStaticEntity( {
    type: 'sphere',
    radius: 0.5,
    segments: 16
  } ) };
  this.sphereTool.onTertiaryDown = function(){ self.removeEntity() };
  
  this.tools[1] = this.removeTool;
  this.tools[2] = this.wallTool;
  this.tools[3] = this.slabTool;
  this.tools[4] = this.doorTool;
  this.tools[5] = this.cubeTool;
  this.tools[6] = this.cylinderTool;
  this.tools[7] = this.sphereTool;
  
  
  // Final Setup ===============================================================
  
  this.setupCursors();
  this.onEnter();
  
}
Builder.prototype = new Toolset();
Builder.prototype.constructor = Builder;





// =============================================================================
// HELPER FUNCTIONS ============================================================
// =============================================================================

// inEpsilon ===================================================================
Builder.prototype.inEpsilon = function( value, compare, epsilon ) {
  return Math.abs( compare - value ) < epsilon;
};

// snapToGrid ==================================================================
Builder.prototype.snapToGrid = function( vec, gridSize ) {
  return new THREE.Vector3(
    parseInt( ( vec.x / gridSize ).toFixed( 0 ), 10) * gridSize,
    parseInt( ( vec.y / gridSize ).toFixed( 0 ), 10) * gridSize,
    parseInt( ( vec.z / gridSize ).toFixed( 0 ), 10) * gridSize
  );
};

// snapToAngle =================================================================
Builder.prototype.snapToAngle = function( euler, degsToRound ) {
 return new THREE.Euler(
    THREE.Math.degToRad( parseInt( ( THREE.Math.radToDeg( euler ) / degsToRound ).toFixed( 0 ), 10) * degsToRound ),
    THREE.Math.degToRad( parseInt( ( THREE.Math.radToDeg( euler ) / degsToRound ).toFixed( 0 ), 10) * degsToRound ),
    THREE.Math.degToRad( parseInt( ( THREE.Math.radToDeg( euler ) / degsToRound ).toFixed( 0 ), 10) * degsToRound ),
    'XYZ'
  );
};

// setupCursors ================================================================
Builder.prototype.setupCursors = function() {

  this.cursor = new Entity( new THREE.Vector3( 0.01, 0.01, 0.01 ) );
  this.cursor.mesh = new THREE.Mesh(
    new THREE.BoxGeometry( 0.05, 0.05, 0.125 ),
    new THREE.MeshLambertMaterial( { color: 0xFF8000, wireframe: false, wrapAround: true } )
  );
  this.cursor.addToWorld();
  
  this.cursorSnap = new Entity( new THREE.Vector3( 0.01, 0.01, 0.01 ) );
  this.cursorSnap.mesh = new THREE.Mesh(
    new THREE.SphereGeometry( 0.05, 16, 16 ),
    new THREE.MeshLambertMaterial( { color: 0x0080FF, wireframe: false, wrapAround: true } )
  );
  this.cursorSnap.addToWorld();
  
  // this.cursorAxis = new THREE.AxisHelper( 1 );
  // this.cursorAxis.position.set( 1, 1, 1 );
  // theScene.add( this.cursorAxis );
  
  this.clearCursors();
};

// clearCursors ================================================================
Builder.prototype.clearCursors = function() {
  
  // TODO Hide the cursor in a better way
  this.cursor.place( 0, 0, -100 );
  this.cursorSnap.place( 0, 0, -100 );
  
};

// =============================================================================
// UTILITY FUNCTIONS ===========================================================
// =============================================================================

// rayToWorld ==================================================================
Builder.prototype.rayToWorld = function( rayFrom, rayTo, forceShowCursor, forceShowCursorSnap ) {
  
  var ray = new CANNON.Ray( rayFrom, rayTo );
  
  var returnObject = {};
  
  var result = ray.intersectWorld( theWorld.physics, { mode: CANNON.Ray.CLOSEST, skipBackfaces: true, collisionFilterMask: 1 | 8 } );
  if ( result ) {
    
    // Result position snapped to the grid
    var snapped = this.snapToGrid( ray.result.hitPointWorld, this.gridSize );
    
    // If no paramater is given use this opject's setting for showing the cursors
    var showCursor = ( forceShowCursor === undefined ) ? this.showCursor : forceShowCursor;
    var showCursorSnap = ( forceShowCursorSnap === undefined ) ? this.showCursorSnap : forceShowCursorSnap;
    if ( showCursor ) {
      this.cursor.place( ray.result.hitPointWorld.x, ray.result.hitPointWorld.y, ray.result.hitPointWorld.z );
    }
    if ( ( showCursorSnap ) && ( this.gridSnap ) ) { 
      this.cursorSnap.place( snapped.x, snapped.y, snapped.z );
    }
    
    var quaternion = new THREE.Quaternion().setFromUnitVectors( Y_AXIS, ray.result.hitNormalWorld );
    
    // console.log( "normal x: " + ray.result.hitNormalWorld.x + "     y: " + ray.result.hitNormalWorld.y + "     z: " + ray.result.hitNormalWorld.z );

    if ( ray.result.hitNormalWorld.z === 1 ) {
      // Hitting a flat horizontal surface from above, rotates the result so it faces the direction the ray is coming from
      // TODO rewrite the conditional to catch slight inclines and treat them as horizontal
      // TODO combine this if block and the one below to reduce code repetition
      
      quaternion.multiply( new THREE.Quaternion().setFromUnitVectors( Z_AXIS, Y_AXIS ) );
      
      var directionVector = new CANNON.Vec3().copy( rayFrom.vsub( rayTo ) );
      directionVector.z = 0;
      directionVector.normalize();
      // For some reason none of the cannon.js vector methods are working
      // So just negate outselves
      directionVector.x = -directionVector.x;
      directionVector.y = -directionVector.y;
      quaternion.multiply( new THREE.Quaternion().setFromUnitVectors( Y_AXIS, directionVector ) );
      
    } else if ( ray.result.hitNormalWorld.z === -1 ) {
      // Hitting a flat horizontal surface from below, rotates the result so it faces the direction the ray is coming from
      
      quaternion.multiply( new THREE.Quaternion().setFromUnitVectors( Z_AXIS, Y_AXIS ) );
      
      var directionVector = new CANNON.Vec3().copy( rayFrom.vsub( rayTo ) );
      directionVector.z = 0;
      directionVector.normalize();
      directionVector.x = -directionVector.x;
      directionVector.y = -directionVector.y;
      quaternion.multiply( new THREE.Quaternion().setFromUnitVectors( directionVector, Y_AXIS ) );
      
      
    } else if (
      this.inEpsilon( ray.result.hitNormalWorld.x, -1, 0.001 ) &&
      this.inEpsilon( ray.result.hitNormalWorld.y, 0, 0.001 ) &&
      this.inEpsilon( ray.result.hitNormalWorld.z, 0, 0.001 ) ) {
      // A bug with the else block below gives the incorrect result if the normal is ( -1, 0, 0 )
      // This catches that scenario and gives the correct result
      
      quaternion = new THREE.Quaternion().setFromUnitVectors( X_AXIS, Z_AXIS );
      quaternion.multiply( new THREE.Quaternion().setFromUnitVectors( Y_AXIS, X_AXIS ) );
      
    } else {
      // Rotate the result so it is flat against the face that the ray collided with,
      // but still parallel with the ground on the appropriate axis.
      
      var vec1 = new THREE.Vector3( ray.result.hitNormalWorld.x, ray.result.hitNormalWorld.y, 0 ).normalize();
      var a = new THREE.Quaternion().setFromUnitVectors( X_AXIS, vec1 ); // correctly aligns the boxes rotated around the Z axis
      
      var vec2 = new THREE.Vector3( ray.result.hitNormalWorld.x, ray.result.hitNormalWorld.y, ray.result.hitNormalWorld.z ).normalize();
      var b = new THREE.Quaternion().setFromUnitVectors( Z_AXIS, vec2 );
      
      quaternion.multiplyQuaternions( b, a );
      
      var c = new THREE.Quaternion().setFromUnitVectors( X_AXIS, Y_AXIS );
      quaternion.multiply( c );
      
    }
      
    if ( showCursor ) {
      this.cursor.rotation.setFromQuaternion( quaternion, 'XYZ' );
      // this.cursorAxis.position.copy( ray.result.hitPointWorld );
      // this.cursorAxis.rotation.setFromQuaternion( quaternion, 'XYZ' );
    }
      
    returnObject.success = true;
    returnObject.body = ray.result.body;
    returnObject.position = new THREE.Vector3().copy( ray.result.hitPointWorld );
    returnObject.snapped = snapped;
    returnObject.rotation = this.cursor.rotation;
    returnObject.quaternion = quaternion;
    
  } else {
    
    this.clearCursors();
    
    returnObject.success = false;
    returnObject.body = undefined;
    returnObject.position = undefined;
    returnObject.snapped = undefined;
    returnObject.rotation = undefined;
    returnObject.quaternion = undefined;
  }
    
  this.raycast = returnObject;
  return returnObject;

};

// placeStaticEntity ===========================================================
Builder.prototype.placeStaticEntity = function( options ) {
  // TODO totally redo this to support different objects and better placement modes (gridsnap, angle snap, snap to objects, just like doors)

  if ( !this.raycast.success || ( options === undefined ) ) { return false; }

  var height;
  if ( options.type === 'box' ) { height = options.size.z; }
  else if ( options.type === 'cylinder' ) { height = options.height; }
  else if ( options.type === 'sphere' ) { height = options.radius * 1.8; }
  
  var placeVector = new THREE.Vector3( 0, 0, 1 );
  var rotationEuler = new THREE.Euler( 0, 0, 0, 'XYZ' );
  
  if ( this.angleSnap ) {
    rotationEuler = this.snapToAngle( this.raycast.rotation, this.angleSize );
    placeVector.applyEuler( rotationEuler );
  } else {
    rotationEuler.set( this.raycast.rotation.x, this.raycast.rotation.y, this.raycast.rotation.z, 'XYZ' );
    placeVector.applyEuler( this.raycast.rotation );
  }
  
  placeVector.multiplyScalar( ( height / 2 ) + 0.001 );
  
  if ( this.gridSnap ) {
    placeVector.add( this.raycast.snapped );
  } else {
    placeVector.add( this.raycast.position );
  }
  
  var newStaticEntity = new StaticEntity( options, placeVector, rotationEuler );
  newStaticEntity.mesh.material = new THREE.MeshLambertMaterial( { color: 0xAAAA88, wireframe: false } );

};

// removeEntity ===================================================================
Builder.prototype.removeEntity = function() {
  if ( !this.raycast.success || ( this.raycast.body === null ) ) { return false; }
  return theWorld.removeEntityByUUID( this.raycast.body.uuid );
};





// =============================================================================
// WALL TOOL ===================================================================
// =============================================================================
  
// setupWall ===================================================================
Builder.prototype.setupWall = function() {
  if ( this.wallTool.preview === null ) {
    this.wallTool.preview = new Entity();
    this.wallTool.preview.mesh = new THREE.Mesh(
      new THREE.BoxGeometry( this.wallTool.depth, this.wallTool.depth, this.wallTool.height ),
      new THREE.MeshLambertMaterial( { color: this.wallTool.color, wireframe: false, transparent: true, opacity: this.wallTool.previewOpacity  } )
    );
    this.wallTool.preview.update = function () {};
    this.wallTool.preview.addToWorld();
  }
  this.clearWall();
};
  
// startWall ===================================================================
Builder.prototype.startWall = function() {
  
  if ( !this.raycast.success ) {
    this.clearWall();
    return false;
  }
  
  if ( this.gridSnap ) {
    this.wallTool.startPoint = this.raycast.snapped;
  } else {
    this.wallTool.startPoint = this.raycast.position;
  }
  
};

// updateWall ===================================================================
Builder.prototype.updateWall = function() {
  
  if ( !this.raycast.success || ( this.wallTool.startPoint === null ) ) {
    this.wallTool.preview.mesh.material.setValues( { color: this.wallTool.previewFailColor } );
    return false;
  }
  
  // TODO add angle snap to walls
  if ( this.gridSnap ) {
    this.wallTool.finishPoint = this.raycast.snapped;
  } else {
    this.wallTool.finishPoint = this.raycast.position;
  }
  
  this.wallTool.averagePoint = new CANNON.Vec3().copy( this.wallTool.startPoint ).vadd( this.wallTool.finishPoint ).scale( 0.5 );
  this.wallTool.direction = new THREE.Vector3().subVectors( this.wallTool.finishPoint, this.wallTool.startPoint );
  this.wallTool.addedHeight = Math.abs( this.wallTool.direction.z );
  this.wallTool.direction.z = 0;
  this.wallTool.length = this.wallTool.direction.length();
  this.wallTool.quaternion = new THREE.Quaternion().setFromUnitVectors( X_AXIS, this.wallTool.direction.normalize() );
  
  // Update preview
  if ( this.wallTool.length <= this.wallTool.depth ) { this.wallTool.length = this.wallTool.depth; }
  this.wallTool.preview.mesh.geometry = new THREE.BoxGeometry( this.wallTool.length, this.wallTool.depth, ( this.wallTool.addedHeight + this.wallTool.height ) );
  this.wallTool.preview.place( this.wallTool.averagePoint.x, this.wallTool.averagePoint.y, this.wallTool.averagePoint.z + this.wallTool.height / 2 );
  this.wallTool.preview.mesh.rotation.setFromQuaternion( this.wallTool.quaternion );
  
  // Wall isn't long enough, change the color of the preview
  if ( this.wallTool.length < 0.5 ) {
    this.wallTool.preview.mesh.material.setValues( { color: this.wallTool.previewFailColor } );
  } else {
    this.wallTool.preview.mesh.material.setValues( { color: this.wallTool.color } );
  }
  
};

// finishWall ==================================================================
Builder.prototype.finishWall = function() {
  
  if ( !this.raycast.success || ( this.wallTool.startPoint === null ) || ( this.wallTool.length < 0.5 ) ) {
    this.clearWall();
    return false;
  }
  
  // Sometimes the quaternion will give a result with a flipped x rotation
  var fixedEuler = new THREE.Euler().setFromQuaternion( this.wallTool.quaternion );
  if (
    this.inEpsilon( fixedEuler.x, -Math.PI, 0.001 ) &&
    this.inEpsilon( fixedEuler.z, Math.PI, 0.001 ) ) {
    fixedEuler.set( 0, 0, 0 );
  }
  
  
  var newWall = new Wall(
    new THREE.Vector3( this.wallTool.averagePoint.x, this.wallTool.averagePoint.y, this.wallTool.averagePoint.z + this.wallTool.height / 2 ), // position
    fixedEuler, // rotation
    // new THREE.Euler().setFromQuaternion( this.wallTool.quaternion ),
    new THREE.Vector3( this.wallTool.length, this.wallTool.depth, ( this.wallTool.addedHeight + this.wallTool.height ) ), // size
    new THREE.MeshLambertMaterial( { color: this.wallTool.color, wireframe: false } ) // material
  );
  
  this.clearWall();
  
};

// clearWall ==================================================================
Builder.prototype.clearWall = function() {
  this.wallTool.startPoint = null;
  this.wallTool.finishPoint = null;
  this.wallTool.preview.place( 0, 0, -100 );
};





// =============================================================================
// SLAB TOOL ===================================================================
// =============================================================================

// setupSlab ===================================================================
Builder.prototype.setupSlab = function() {
  if ( this.slabTool.preview === null ) {
    this.slabTool.preview = new Entity();
    this.slabTool.preview.mesh = new THREE.Mesh(
      new THREE.BoxGeometry( 1, 1, this.slabTool.height ),
      new THREE.MeshLambertMaterial( { color: this.slabTool.color, wireframe: false, transparent: true, opacity: this.slabTool.previewOpacity  } )
    );
    this.slabTool.preview.update = function () {};
    this.slabTool.preview.addToWorld();
  }
  this.clearSlab();
};

// startSlab ===================================================================
Builder.prototype.startSlab = function() {
  
  if ( !this.raycast.success ) {
    this.clearSlab();
    return false;
  }
  
  if ( this.gridSnap ) {
    this.slabTool.startPoint = this.raycast.snapped;
  } else {
    this.slabTool.startPoint = this.raycast.position;
  }
  
};

// updateSlab ===================================================================
Builder.prototype.updateSlab = function() {
  
  if ( !this.raycast.success || ( this.slabTool.startPoint === null ) ) { 
    return false;
  }
  
  if ( this.gridSnap ) {
    this.slabTool.finishPoint = this.raycast.snapped;
  } else {
    this.slabTool.finishPoint = this.raycast.position;
  }
  
  this.slabTool.averagePoint = new CANNON.Vec3().copy( this.slabTool.startPoint ).vadd( this.slabTool.finishPoint ).scale( 0.5 );
  this.slabTool.direction = new THREE.Vector3().subVectors( this.slabTool.finishPoint, this.slabTool.startPoint );
  this.slabTool.addedHeight = Math.abs( this.slabTool.direction.z );
  this.slabTool.width = Math.abs( this.slabTool.direction.x );
  this.slabTool.length = Math.abs( this.slabTool.direction.y );
  this.slabTool.direction.z = 0;
  this.slabTool.direction.normalize();
  
  // Update slab preview, change the color if it's not big enough
  if ( ( this.slabTool.width < 0.5 ) || ( this.slabTool.length < 0.5 ) ) {
    this.slabTool.preview.mesh.material.setValues( { color: this.slabTool.previewFailColor } );
  } else {
    this.slabTool.preview.mesh.material.setValues( { color: this.slabTool.color } );
  }
  this.slabTool.preview.mesh.geometry = new THREE.BoxGeometry( this.slabTool.width, this.slabTool.length, this.slabTool.height + this.slabTool.addedHeight );
  this.slabTool.preview.place( this.slabTool.averagePoint.x, this.slabTool.averagePoint.y, this.slabTool.averagePoint.z + this.slabTool.height / 2 + this.slabTool.heightOffset );
  
};

// finishSlab ==================================================================
Builder.prototype.finishSlab = function() {
  
  if ( !this.raycast.success || ( this.slabTool.startPoint === null ) || ( this.slabTool.width < 0.5 ) || ( this.slabTool.length < 0.5 ) ) {
    this.clearSlab();
    return false;
  }
  
  var newStaticEntity = new StaticEntity(
    {
      type: 'box',
      size: new THREE.Vector3( this.slabTool.width + 0.0001, this.slabTool.length + 0.0001, this.slabTool.height + this.slabTool.addedHeight )
    }, 
    new THREE.Vector3( this.slabTool.averagePoint.x, this.slabTool.averagePoint.y, this.slabTool.averagePoint.z + this.slabTool.height / 2 + this.slabTool.heightOffset )
  );
  newStaticEntity.mesh.material = new THREE.MeshLambertMaterial( { color: this.slabTool.color, wireframe: false } );
  newStaticEntity.physics.body.kind = 'slab';
  
  this.clearSlab();
  
};

// clearSlab ===================================================================
Builder.prototype.clearSlab = function() {
  this.slabTool.startPoint = null;
  this.slabTool.finishPoint = null;
  this.slabTool.preview.place( 0, 0, -100 );
};





// =============================================================================
// DOOR TOOL ===================================================================
// =============================================================================
  
// setupDoor ===================================================================
Builder.prototype.setupDoor = function() {
  
  if ( this.doorTool.preview !== null ) { return }

  // TODO actually generate this geometry properly my setting vertices and faces
  //      I guess that will be part of the generative geometry stuff

  var frame = new THREE.Mesh(
    new THREE.Geometry(),
    new THREE.MeshLambertMaterial( { color: this.doorTool.color, wireframe: false } )
  );
  
  var lintel = new THREE.Mesh(
    new THREE.BoxGeometry( this.doorTool.size.x, this.doorTool.size.y, this.doorTool.frameWidth )
  );
  lintel.position.z = ( this.doorTool.size.z / 2 ) - ( this.doorTool.frameWidth / 2 );
  lintel.updateMatrix();
  frame.geometry.merge( lintel.geometry, lintel.matrix );
  
  var jamb1 = new THREE.Mesh(
    new THREE.BoxGeometry( this.doorTool.frameWidth, this.doorTool.size.y, ( this.doorTool.size.z - this.doorTool.frameWidth - this.doorTool.thresholdOffset ) )
  );
  jamb1.position.z = -( this.doorTool.frameWidth / 2 ) + ( this.doorTool.thresholdOffset / 2 );
  jamb1.position.x = ( this.doorTool.size.x / 2 ) - ( this.doorTool.frameWidth / 2 );
  jamb1.updateMatrix();
  frame.geometry.merge( jamb1.geometry, jamb1.matrix );
  
  var jamb2 = new THREE.Mesh(
    new THREE.BoxGeometry( this.doorTool.frameWidth, this.doorTool.size.y, ( this.doorTool.size.z - this.doorTool.frameWidth - this.doorTool.thresholdOffset ) )
  );
  jamb2.position.z = -( this.doorTool.frameWidth / 2 ) + ( this.doorTool.thresholdOffset / 2 );
  jamb2.position.x = -( this.doorTool.size.x / 2 ) + ( this.doorTool.frameWidth / 2 );
  jamb2.updateMatrix();
  frame.geometry.merge( jamb2.geometry, jamb2.matrix );
  
  var threshold = new THREE.Mesh(
    new THREE.BoxGeometry( this.doorTool.size.x, this.doorTool.size.y, this.doorTool.frameWidth )
  );
  threshold.position.z  = -( this.doorTool.size.z / 2 ) - ( this.doorTool.frameWidth / 2 ) + this.doorTool.thresholdOffset;
  threshold.updateMatrix();
  frame.geometry.merge( threshold.geometry, threshold.matrix );

  frame.geometry.mergeVertices();
  
  this.doorTool.mesh = new THREE.Mesh(
    frame.geometry,
    frame.material
  );
 
  this.doorTool.preview = new Entity();
  this.doorTool.preview.mesh = new THREE.Mesh(
    frame.geometry,
    new THREE.MeshLambertMaterial( { color: this.doorTool.previewColor, wireframe: false, transparent: true, opacity: this.doorTool.previewOpacity } )
  );
  this.doorTool.preview.update = function () {};
  this.doorTool.preview.addToWorld();
  
  this.clearDoor();
};
  
// updateDoor ===================================================================
Builder.prototype.updateDoor = function() {
  
  if (
    ( !this.raycast.success ) ||
    ( this.raycast.body.properties === 'null' ) ||
    ( this.raycast.body.properties === undefined ) ||
    ( this.raycast.body.properties.kind !== 'wall' ) ) {
    this.clearDoor();
    return false;
  }
  
  var wallProperties = this.raycast.body.properties;
  
  // Doors need to be constrained to the walls, so first we compare the size of the wall to the door
  // and find the minimum and maximum allowable placements
  var wallHalfSize = new THREE.Vector3( wallProperties.size.x / 2, wallProperties.size.y / 2, wallProperties.size.z / 2 );
  var doorHalfSize = new THREE.Vector3().copy( this.doorTool.size ).multiplyScalar( 0.5 );
  doorHalfSize.y = 0; // We don't care about the depth of the door, it's going to be centered in the wall later
  var maxWallExtents = new THREE.Vector3().copy( wallHalfSize ).sub( doorHalfSize );
  var minWallExtents = new THREE.Vector3().copy( maxWallExtents ).negate();
  
  // If door is smaller than wall, return false and do nothing
  if (
    ( doorHalfSize.x > wallHalfSize.x ) ||
    ( doorHalfSize.y > wallHalfSize.y ) ||
    ( doorHalfSize.z > wallHalfSize.z )
  ) {
    this.clearDoor();
    return false;
  }
  
  // Then we find where the 3D ray cursor is compared to the center of the wall object
  var centerToCursor = new THREE.Vector3().copy( this.raycast.position );
  centerToCursor.sub( this.raycast.body.position );
  
  // We need to rotate centerToCursor to be aligned with the world axis for the clamping to work
  var b = new THREE.Vector3( 1, 0, 0 ).applyQuaternion( this.raycast.body.quaternion );
  var c = new THREE.Quaternion().setFromUnitVectors( b, X_AXIS );
  centerToCursor.applyQuaternion( c );
  
  // Snap to grid relative to the wall direction
  if ( this.gridSnap ) { 
    centerToCursor = this.snapToGrid( centerToCursor, this.gridSize );
  }
  
  // Clamp the centerToCursor vector so it's within the allowable range
  centerToCursor.clamp( minWallExtents, maxWallExtents );
  
  // Center the door with the wall depth-wise
  centerToCursor.y = 0;
  this.doorTool.wallOffset = new THREE.Vector3().copy( centerToCursor );
  
  // Make sure we aren't overlapping any other preexiting doors in this wall
  this.doorTool.boundingBox = new THREE.Box2(
    new THREE.Vector2( centerToCursor.x - doorHalfSize.x, centerToCursor.z - doorHalfSize.z ),
    new THREE.Vector2( centerToCursor.x + doorHalfSize.x, centerToCursor.z + doorHalfSize.z )
  );
  for (var i = 0; i < this.raycast.body.properties.self.children.length; i++ ) {
    var child = wallProperties.self.children[i];
    // var childBox = new THREE.Box2(
    //   new THREE.Vector2( child.offset.x - child.halfSize.x, child.offset.z - child.halfSize.z ),
    //   new THREE.Vector2( child.offset.x + child.halfSize.x, child.offset.z + child.halfSize.z )
    // );
    
    if ( this.doorTool.boundingBox.isIntersectionBox( child.boundingBox ) ) {
      this.wallTool.preview.mesh.material.setValues( { color: this.wallTool.previewFailColor } );
      this.clearDoor();
      return false;
    }
  }
  
  // Then rotate it back to the rotation of the wall
  centerToCursor.applyQuaternion( this.raycast.body.quaternion );
  
  this.doorTool.position = new THREE.Vector3().copy( centerToCursor.add( this.raycast.body.position ) );
  this.doorTool.rotation = new THREE.Euler().setFromQuaternion( this.raycast.body.quaternion, 'XYZ' );
  
  this.doorTool.preview.place( this.doorTool.position.x, this.doorTool.position.y, this.doorTool.position.z );
  this.doorTool.preview.rotate( this.doorTool.rotation.x, this.doorTool.rotation.y, this.doorTool.rotation.z );
  
};

// finishDoor ==================================================================
Builder.prototype.finishDoor = function() {
  
  if ( this.doorTool.position === null ) {
    return false;
  }
  
  var newProperties = {
    kind: 'door',
    size: this.doorTool.size,
    halfSize: new THREE.Vector3().copy( this.doorTool.size ).multiplyScalar( 0.5 ),
    offset: this.doorTool.wallOffset,
    boundingBox: this.doorTool.boundingBox,
    parent: this.raycast.body.properties.self
  };
  
  // console.log( this.raycast.body.properties.self.size );
  // console.log( this.raycast.body.properties.self.rotation );
  // console.log( newProperties.offset );
  
  // Add the mesh to the world
  var newMesh = new THREE.Mesh( this.doorTool.mesh.geometry, this.doorTool.mesh.material );
  newMesh.position.copy( this.doorTool.position );
  newMesh.rotation.copy( this.doorTool.rotation );
  // theScene.add( newMesh );
  
  // var windowMesh = new THREE.Mesh( 
  //   new THREE.BoxGeometry(
  //     this.doorTool.size.x - this.doorTool.frameWidth / 2,
  //     0.01,
  //     this.doorTool.size.z - this.doorTool.frameWidth / 2
  //   ), 
  //   // new THREE.MeshLambertMaterial( { color: 0xCCFFCC, wireframe: false, transparent: true, opacity: 0.1, side: THREE.DoubleSide } )
  //   new THREE.MeshPhongMaterial( { color: 0x0080FF, transparent: true, opacity: 0.1, specular: 0xFFFFFF, shininess: 100 } )
  // );
  // windowMesh.position.copy( this.doorTool.position );
  // windowMesh.rotation.copy( this.doorTool.rotation );
  // theScene.add( windowMesh );
  
  var newDoor = new WallInset(
    this.doorTool.position, // position
    this.doorTool.rotation, // rotation
    this.doorTool.size, // size 
    newProperties, // properties
    newMesh );
    
  // Add the door as a child to the wall
  this.raycast.body.properties.self.addChild( newDoor.getProperties() );
  
};

// clearDoor ===================================================================
Builder.prototype.clearDoor = function() {
  this.doorTool.position = null;
  this.doorTool.rotation = null;
  this.doorTool.preview.place( 0, 0, -100 );
};