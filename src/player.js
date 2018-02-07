/* global THREE CANNON X_AXIS Y_AXIS Z_AXIS PHYSICS_GROUP_PLAYER PHYSICS_GROUP_WORLD PHYSICS_GROUP_ENTITIES 
  theTimeDelta Entity StaticEntity theWorld theOverlay theConfig Builder PlayerState Equipment UI*/
"use strict";

// =============================================================================
// PLAYER ======================================================================
// =============================================================================
// Extends Entity, provides methods for movement and control of a human-type character

function Player () {
  
  var self = this;
  
  // Mesh ======================================================================

	this.size = new THREE.Vector3( 0.9, 0.9, 1.8 );
  this.position = new THREE.Vector3( 0, 0, 0.45 );
  this.rotation = new THREE.Euler( 0, 0, 0, 'ZYX' );
  
  this.bottomSphereMesh = new THREE.Mesh(
    new THREE.SphereGeometry( 0.45, 32, 32, Math.PI, Math.PI, 0, Math.PI ),
    new THREE.MeshLambertMaterial( { color: 0x166eb6, wireframe: false, wrapAround: true } )
  );
  
  this.cylinderMesh = new THREE.Mesh(
    new THREE.CylinderGeometry( 0.45, 0.45, 0.9, 64, 8, true ),
    new THREE.MeshLambertMaterial( { color: 0x166eb6, wireframe: false, wrapAround: true } )
  );
  this.cylinderMesh.rotation.y = Math.PI / 32;
  this.cylinderMesh.rotation.x = Math.PI / 2;
  this.cylinderMesh.position.z = 0.45;
  
  this.topSphereMesh = new THREE.Mesh(
    new THREE.SphereGeometry( 0.45, 32, 32, 0, Math.PI, 0, Math.PI ),
    new THREE.MeshLambertMaterial( { color: 0x166eb6, wireframe: false, wrapAround: true } )
  );
  this.topSphereMesh.position.z = 0.9;

  this.cylinderMesh.updateMatrix();
  this.bottomSphereMesh.geometry.merge( this.cylinderMesh.geometry, this.cylinderMesh.matrix );

  this.topSphereMesh.updateMatrix();
  this.bottomSphereMesh.geometry.merge( this.topSphereMesh.geometry, this.topSphereMesh.matrix );
  
  this.bottomSphereMesh.geometry.mergeVertices();

  this.mesh = this.bottomSphereMesh;
  this.mesh.position.set( this.position.x, this.position.y, this.position.z );
  
  this.mesh.castShadow = true;
  this.mesh.receiveShadow = true;
  
  // Physics ===================================================================
  
  this.physics.enabled = true;
  
  this.physics.sphereShape = new CANNON.Sphere( 0.45 );
  this.physics.cylinderShape = new CANNON.Cylinder( 0.45, 0.45, 0.9, 64 );
  this.physics.mass = 20;
  
  this.physics.body = new CANNON.Body( { mass: this.physics.mass } );
  // this.physics.body.type = CANNON.Body.KINEMATIC; // TODO Consider if implementing this would be superior to DYNAMIC
  this.physics.body.addShape( this.physics.sphereShape, new CANNON.Vec3( this.position.x, this.position.y, this.position.z - 0.45) );
  this.physics.body.addShape( this.physics.cylinderShape, new CANNON.Vec3( this.position.x, this.position.y, this.position.z ) );
  this.physics.body.addShape( this.physics.sphereShape, new CANNON.Vec3( this.position.x, this.position.y, this.position.z + 0.45 ) );
  
  this.physics.body.position.set( this.position.x, this.position.y, this.position.z );
  this.physics.body.quaternion.setFromEuler( this.rotation.x, this.rotation.y, this.rotation.z, 'ZYX');
  
  this.physics.body.collisionFilterGroup = 2; // Collision group 2, collides with everything, but the player rays won't collide with it
  this.physics.body.collisionFilterMask = 1 | 2 | 4;
  
  this.physics.body.material = theWorld.physics.playerMaterial;
  this.physics.body.fixedRotation = true; // prevents rotation
  this.physics.body.updateMassProperties();
  this.physics.body.gravity = new CANNON.Vec3( 0, 0, 0 );
  this.physics.body.playerGravity = new CANNON.Vec3( 0, 0, -35 );
    // The is the custom value for gravity applied just to the player
    // Can be set to theWorld.physics.gravity if you want
  
  this.physics.groundContact = false;
  this.physics.groundRay = false;
  this.physics.onGround = false;
  
  theWorld.physics.add( this.physics.body );
  
  // Interaction and Commands ==================================================
  
  this.state = {};
  this.commands = {};
  this.resetCommands();
  
  // Builder State =============================================================
  
  this.builder = new Builder();
  this.state.builder = new PlayerState();
  this.state.builder.toolset = this.builder;
  
  this.state.builder.update = function () {

    var interactVector = new THREE.Vector3( 0, 1, 0 );
    interactVector.applyAxisAngle( X_AXIS, self.rotation.x );
    interactVector.applyAxisAngle( Z_AXIS, self.rotation.z );
    interactVector.multiplyScalar( self.interactionDistance );
  
    var rayFrom = new CANNON.Vec3().copy( self.physics.body.position );
    rayFrom.z = rayFrom.z + ( self.size.z * 0.4 );
    
    var rayTo = new CANNON.Vec3().copy( rayFrom ).vadd( interactVector );
    
    self.builder.rayToWorld( rayFrom, rayTo );
    
  };
  
  this.state.builder.ui = "builderBar";
  UI["builderBar"].makeButtons( this.builder.tools );
  
  this.state.builder.onEnter = function () { theOverlay.elements.builderBar.toggle( true ) };
  this.state.builder.onExit = function () {
    theOverlay.elements.builderBar.toggle( false );
    self.builder.cursor.place( 0, 0, -100 );
    self.builder.cursorSnap.place( 0, 0, -100 );
  };
  
  
  // Interact State ============================================================
  
  this.equipment = new Equipment();
  
  this.state.interact = new PlayerState();
  this.state.interact.toolset = this.equipment;

  this.state.interact.ui = "equipmentBar";
  UI["equipmentBar"].makeButtons( this.equipment.tools );

  this.state.interact.onEnter = function () { theOverlay.elements.equipmentBar.toggle( true ) };
  this.state.interact.onExit = function () { theOverlay.elements.equipmentBar.toggle( false ) };
  
  // Options ===================================================================
  
  this.walkForce = 40;
  this.walkForceInAir = 15;
  this.maxWalkVelocity = 10;
  // this.walkVelocity = new CANNON.Vec3( 0, 0, 0 );
  
  this.jumpForce = 250; // Impulse
  // this.jumpVelocity = new CANNON.Vec3( 0, 0, 0 );
  
  this.frictionGround = 7;
  this.frictionAir = 0.1;

  this.rotationSpeed = Math.PI * 0.75; // Radians per second
    // Rate at which the player turns using the keyboard

  this.interactionDistance = 6;
  
  // Have to define it this way so the previous state button works
  this.state.current = new PlayerState( this.state.interact );
  this.state.current.setState( this.state.builder );
  
}
Player.prototype = new Entity();
Player.prototype.constructor = Player;

// update ======================================================================
// Called every frame, processes the input commands and runs the physics
Player.prototype.update = function() {
  
  this.state.current.update();
  
  this.checkIfOnGround();
  
  // These if-blocks handle conflicting directional movement commands
  if ( this.commands.walkForward && this.commands.walkBackward ) {
    this.commands.walkForward = false;
    this.commands.walkBackward = false;
  }
  if ( this.commands.walkLeft && this.commands.walkRight ) {
    this.commands.walkLeft = false;
    this.commands.walkRight = false;
  }
  if ( this.commands.turnLeft && this.commands.turnRight ) {
    this.commands.turnLeft = false;
    this.commands.turnRight = false;
  }
  
  // Turning
  if ( this.commands.turnLeft ) {
    this.rotate( new THREE.Vector3( 0, 0, 1 ) );
  } else if ( this.commands.turnRight ) {
    this.rotate( new THREE.Vector3( 0, 0, -1 ) );
  }
  
  // Walking
  if ( this.commands.walkForward && this.commands.walkLeft ) {
    this.move( new THREE.Vector3( -1, 1, 0 ).normalize() );
  } else if ( this.commands.walkForward && this.commands.walkRight ) {
    this.move( new THREE.Vector3( 1, 1, 0 ).normalize() );
  } else if ( this.commands.walkBackward && this.commands.walkLeft ) {
    this.move( new THREE.Vector3( -1, -1, 0 ).normalize() );
  } else if ( this.commands.walkBackward && this.commands.walkRight ) {
    this.move( new THREE.Vector3( 1, -1, 0 ).normalize() );
  } else if ( this.commands.walkForward ) {
    this.move( new THREE.Vector3( 0, 1, 0 ) );
  } else if ( this.commands.walkBackward ) {
    this.move( new THREE.Vector3( 0, -1, 0 ) );
  } else if ( this.commands.walkLeft ) {
    this.move( new THREE.Vector3( -1, 0, 0 ) );
  } else if ( this.commands.walkRight ) {
    this.move( new THREE.Vector3( 1, 0, 0 ) );
  }
  
  this.applyGravity();
  
  if (
    !this.commands.walkForward &&
    !this.commands.walkBackward &&
    !this.commands.walkLeft &&
    !this.commands.walkRight
  ) {
    this.applyFriction();
  }
  
  this.position.copy( this.physics.body.position );
  // this.rotation.setFromQuaternion( this.physics.body.quaternion );
  
  this.mesh.position.set( this.position.x, this.position.y, this.position.z );
  this.mesh.rotation.set( 0, this.rotation.y, this.rotation.z );

  this.resetCommands();

};





// =============================================================================
// Commands ====================================================================
// =============================================================================
// These will need to be heavily reworked for alternate input schemes
Player.prototype.walkForward = function() { this.commands.walkForward = true; };
Player.prototype.walkBackward = function() { this.commands.walkBackward = true; };
Player.prototype.walkLeft = function() { this.commands.walkLeft = true; };
Player.prototype.walkRight = function() { this.commands.walkRight = true; };
Player.prototype.turnLeft = function() { this.commands.turnLeft = true; };
Player.prototype.turnRight = function() { this.commands.turnRight = true; };

Player.prototype.resetCommands = function() {
  this.commands.walkForward = false;
  this.commands.walkBackward = false;
  this.commands.walkLeft = false;
  this.commands.walkRight = false;
  this.commands.turnLeft = false;
  this.commands.turnRight = false;
  this.commands.mouseLookX = false;
  this.commands.mouseLookY = false;
};

// move ========================================================================
Player.prototype.move = function( moveVector ) {

  moveVector.applyAxisAngle( Z_AXIS, this.rotation.z );
  
  if ( this.physics.onGround ) { 
    moveVector.multiplyScalar( this.walkForce * theTimeDelta );
  } else {
    moveVector.multiplyScalar( this.walkForceInAir * theTimeDelta );
  }
    
  this.physics.body.velocity = this.physics.body.velocity.vadd( moveVector );
  
  if ( this.physics.body.velocity.length() > this.maxWalkVelocity ) {
    this.physics.body.velocity = this.physics.body.velocity.unit().scale( this.maxWalkVelocity );
  }
    
  // TODO Limit only walking velocity, not total velocity
  // this.walkVelocity = new CANNON.Vec3( moveVector.x, moveVector.y, moveVector.z );
  // if ( this.walkVelocity.length() > this.maxWalkVelocity ) {
  //   this.walkVelocity = this.walkVelocity.unit().scale( this.maxWalkVelocity );
  // }

};

// rotate ======================================================================
// Rotates the player in the 2D plane
Player.prototype.rotate = function( rotationVector ) {

  rotationVector.multiplyScalar( this.rotationSpeed * theTimeDelta );
  this.rotation.setFromVector3( this.rotation.toVector3().add( rotationVector ), 'ZYX' );

  this.physics.body.quaternion.setFromEuler( 0, 0, this.rotation.z, 'ZYX');
};

// jump ========================================================================
Player.prototype.jump = function() {
  if ( this.physics.onGround ) {
    this.physics.body.applyLocalImpulse( new CANNON.Vec3( 0, 0, this.jumpForce ), new CANNON.Vec3( 0, 0, 0 ) );
    // this.physics.body.velocity = this.physics.body.velocity.vadd( new CANNON.Vec3( 0, 0, this.jumpForce ) );
  }

  // if ( this.physics.onGround ) {
  //   this.jumpVelocity.set( 0, 0, this.jumpForce * theTimeDelta );
  // }
};

// crouch ======================================================================
Player.prototype.crouch = function() {
  this.physics.body.applyLocalImpulse( new CANNON.Vec3( 0, 0, -this.jumpForce ), new CANNON.Vec3( 0, 0, 0 ) );
};

// mouseLook ===================================================================
Player.prototype.mouseLook = function( event ) {
  
  var rotationVector = new THREE.Vector3( 0, 0, 0 );

  // X movement in screenspace is Z rotation in worldspace
  rotationVector.z -= event.movementX * 0.0025 * theConfig.mouse.lookSensitivity;
  
  // Y movement in screenspace is X rotation in worldspace
  rotationVector.x -= event.movementY * 0.0025 * theConfig.mouse.lookSensitivity;
  
  this.rotation.setFromVector3( this.rotation.toVector3().add( rotationVector ), 'ZYX' );
  
  // Clamp up/down rotation so you can't go around backwards
  var min = -Math.PI / 2;
  var max = Math.PI / 2;
  if ( this.rotation.x < min ) { this.rotation.x = min; }
  if ( this.rotation.x > max ) { this.rotation.x = max; }
  
  this.physics.body.quaternion.setFromEuler( 0, 0, this.rotation.z, 'ZYX');
  
};






// =============================================================================
// Physics =====================================================================
// =============================================================================

// checkIfOnGround =============================================================
Player.prototype.checkIfOnGround = function() {

  this.physics.groundContact = false;
  this.physics.groundRay = false;
  this.physics.onGround = false;
  
  var upAxis = new CANNON.Vec3( 0, 0, 1 );
  var maxInclineDot = 0.707;
    // This is the dot product between the normals of each colliding object
    // Use a good value between 0 and 1 to determine if a slope is too steep for
    // the player to be able to walk on.
  
  // Contact
  
  if ( this.physics.contacts.length > 0 ) {
    for( var i = 0; i < this.physics.contacts.length; i++ ) {
      
      // Inspired by http://schteppe.github.io/cannon.js/examples/js/PointerLockControls.js
      var contactNormal = new CANNON.Vec3();
      var contactPoint = new CANNON.Vec3();
      
      if( this.physics.contacts[i].bi.id === this.physics.body.id ) {
        // bi is the player body, flip the contact normal
        this.physics.contacts[i].ni.negate( contactNormal );
        contactPoint = this.physics.contacts[i].ri.vadd( this.physics.body.position );
      } else {
        contactNormal.copy( this.physics.contacts[i].ni );
        // bi is something else. Keep the normal as it is
        contactPoint = this.physics.contacts[i].rj.vadd( this.physics.body.position );
      }
      
      if( contactNormal.dot(upAxis) > maxInclineDot ) {
        
        // this.contactGroundBox.place( contactPoint.x, contactPoint.y, contactPoint.z );
        // this.contactGroundBox.mesh.material = new THREE.MeshLambertMaterial( { color: 0xFF00FF, wireframe: true, wrapAround: true } );
        
        this.physics.groundContact = true;
        this.physics.onGround = true;
      }
      
    }
  }
  
  // Ray
  
  var rayFrom = new CANNON.Vec3().copy( this.physics.body.position );
  var rayTo = new CANNON.Vec3().copy( this.physics.body.position );
  rayTo.z = rayTo.z - ( 0.9 + 0.01 );
  
  var ray = new CANNON.Ray( rayFrom, rayTo );
  
  var intersection = ray.intersectWorld( theWorld.physics, { mode: CANNON.Ray.CLOSEST, skipBackfaces: true, collisionFilterMask: 1 } );
  if( intersection ) {
    if( ray.result.hitNormalWorld.dot(upAxis) > maxInclineDot ) {
      this.physics.groundRay = true;
      this.physics.onGround = true;
    }
  }
  
  return this.physics.onGround;

};


// applyFriction ===============================================================
Player.prototype.applyFriction = function() {
  
  // Get 2D velocity
  var velocity2D = new THREE.Vector2( this.physics.body.velocity.x, this.physics.body.velocity.y );

  if ( velocity2D.length() < 0.001 ) {
    // The 2D velocity is below the cutoff, just set it to zero and return
    velocity2D.x = 0;
    velocity2D.y = 0;
    return;
  } else {
    if ( this.physics.onGround ) { // Apply ground friction
      velocity2D.multiplyScalar( 1 - ( this.frictionGround * theTimeDelta ) );
    } else { // Apply air friction
      velocity2D.multiplyScalar( 1 - ( this.frictionAir * theTimeDelta ) );
    }
  }

  this.physics.body.velocity.set( velocity2D.x, velocity2D.y, this.physics.body.velocity.z );

};

// applyGravity =====================================================================
// TODO need to fix this to fix sliding on slopes. Really, I need to fix player movement period.
Player.prototype.applyGravity = function() {
  
  // if ( this.physics.groundContact ) {
  //   this.physics.body.gravity = new CANNON.Vec3( 0, 0, 0 );
  // } else {
  //   this.physics.body.gravity = this.physics.playerGravity;
  //   // this.physics.body.velocity = this.physics.body.velocity.vadd( this.physics.body.playerGravity );
  // }
  this.physics.body.gravity = this.physics.playerGravity;
  
};