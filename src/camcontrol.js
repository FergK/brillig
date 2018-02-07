
/* global THREE theCamera theScene theViewport theTimeDelta theConfig*/

// =============================================================================
// CAMERA CONTROLS =============================================================
// =============================================================================

function CamControl( mode, target ) {

  this.mode = mode;
  // 0 - Overhead orthographic
  // 1 - Overhead perspective
  // 2 - Third-Person perspective
  // 3 - First-Person perspective

  this.target = target;
  
  this.moveSpeed = 15; // Meters per second
  this.rotationSpeed = Math.PI / 2; // Radians per second
  
  this.targetPositionLock = false;
  this.targetRotationLock = false;
  
  this.FOV = theConfig.gameplay.FOV;
  
  this.defaultOrthographicScale = 10;
  this.orthographicScale = this.defaultOrthographicScale;
  
  this.cameraOrthographic = new THREE.OrthographicCamera(
    -theViewport.width * ( 0.5 / this.orthographicScale ),  // Left
    theViewport.width * ( 0.5 / this.orthographicScale ),   // Right
    theViewport.height * ( 0.5 / this.orthographicScale ),  // Top
    -theViewport.height * ( 0.5 / this.orthographicScale ), // Bottom
    -1000, // Near
    1000   // Far
  );
  
  this.cameraPerspective = new THREE.PerspectiveCamera(
    this.FOV, // Field of view
    theViewport.width / theViewport.height, // Aspect ratio
    0.01, // Near
    500 // Far
  );
  
  if ( this.mode === 0 ) {
    this.camera = this.cameraOrthographic;
  } else {
    this.camera = this.cameraPerspective;
  }
  
  this.camera.position = { x:0, y:0, z:0 };
  this.camera.lookAt( { x:0, y:0, z:0 } );
  theScene.add( this.camera );
  
  this.setMode( this.mode );

}
CamControl.prototype.constructor = CamControl;

// Move ========================================================================
// Moves the camera on the 2D plane
CamControl.prototype.move = function( moveVector ) {

  moveVector.applyAxisAngle( new THREE.Vector3( 0, 0, 1 ), this.camera.rotation.z );
  moveVector.multiplyScalar( this.moveSpeed * theTimeDelta );
  this.camera.position.add( moveVector );

};

// Rotate ======================================================================
// Rotates the camera
CamControl.prototype.rotate = function( rotationVector ) {

  rotationVector.multiplyScalar( this.rotationSpeed * theTimeDelta );
  this.camera.rotation.setFromVector3( this.camera.rotation.toVector3().add( rotationVector ), 'ZYX' );

};

// mouseLook ===================================================================
// Accepts mouse movement event and changes it into rotation
CamControl.prototype.mouseLook = function( event ) {
  
  var rotationVector = new THREE.Vector3( 0, 0, 0 );

  // X movement in screenspace is Z rotation in worldspace
  rotationVector.z -= event.movementX * 0.0025 * theConfig.mouse.lookSensitivity;
  
  // Y movement in screenspace is X rotation in worldspace
  rotationVector.x -= event.movementY * 0.0025 * theConfig.mouse.lookSensitivity;
  
  this.camera.rotation.setFromVector3( this.camera.rotation.toVector3().add( rotationVector ), 'ZYX' );
  
  // Clamp up/down rotation so you can't go around backwards
  var min = 0;
  var max = Math.PI;
  if ( this.camera.rotation.x < min ) { this.camera.rotation.x = min; }
  if ( this.camera.rotation.x > max ) { this.camera.rotation.x = max; }

};

// resetToZero =================================================================
// Resets the camera to the 0 position and rotation
CamControl.prototype.resetToZero = function( rotationVector ) {

  this.camera.position.set( 0, 0, 0 );
  this.camera.rotation.setFromVector3( new THREE.Vector3( 0, 0, 0 ), 'ZYX' );
  
  this.setMode( this.mode );

};

// Zoom ========================================================================
// Zooms the camera in or out according to the mode of the camera
// If the camera is orthographic, it changes the scaling of the camera
// If the camera is overhead perspective, it changes the height of the camera
// If the camera is perspective, it changes the FOV of the camera
// Direction, 0 = zoom in, 1 = zoom out
// TODO: Fix this shit function
CamControl.prototype.zoom = function( direction, magnitude ) {

  if ( this.mode === 0 ) {
    
    if ( direction === 0 ) {    
      this.setScale( this.orthographicScale / ( 1.015 * magnitude ) );
    } else if ( direction === 1 ) {
      this.setScale( this.orthographicScale * ( 1.015 * magnitude ) );
    }
    
  } else if ( this.mode === 1 ) {
    
    if ( direction === 0 ) {
      this.overheadHeight *= ( 1.015 * magnitude );
    } else if ( direction === 1 ) {
      this.overheadHeight /= ( 1.015 * magnitude );
    }
    
    this.camera.position.setZ( this.overheadHeight );
    
  } else if ( ( this.mode === 2 ) || ( this.mode === 3 ) ) {
    
    if ( direction === 0 ) {
      this.setFOV( this.FOV * ( 1.005 * magnitude ) );
    } else if ( direction === 1 ) {
      this.setFOV( this.FOV / ( 1.005 * magnitude ) );
    }
    
  } 

};

// setScale ====================================================================
// Sets the orthographic scale of the camera to an given value
CamControl.prototype.setScale = function( value ) {

  this.orthographicScale = value;
  
  this.camera.left = -theViewport.width * ( 0.5 / this.orthographicScale );
  this.camera.right = theViewport.width * ( 0.5 / this.orthographicScale );
  this.camera.top = theViewport.height * ( 0.5 / this.orthographicScale );
  this.camera.bottom = -theViewport.height * ( 0.5 / this.orthographicScale );
  this.camera.updateProjectionMatrix();

};

// setFOV ======================================================================
// Sets the FOV of the camera to an given value
CamControl.prototype.setFOV = function( FOV ) {

  this.FOV = FOV;
  this.camera.fov = FOV;
  this.camera.aspect = theViewport.width / theViewport.height;
  this.camera.updateProjectionMatrix();

};

// placeCamera =================================================================
// Places camera at at a given position
CamControl.prototype.placeCamera = function( x, y, z ) {
  this.camera.position.set( x, y, z );
};

// setMode =====================================================================
CamControl.prototype.setMode = function( mode ) {
  this.mode = mode;
  
  if ( this.mode === 0 ) {
    
    this.camera = this.cameraOrthographic;
    this.camera.rotation.order = 'ZYX';
    this.setScale( this.orthographicScale );
    this.camera.position.z = this.overheadHeight;
    
  } else if ( this.mode === 1 ) {
    
    this.camera = this.cameraPerspective;
    this.camera.rotation.order = 'ZYX';
    
    this.camera.rotation.x = Math.PI/2;
    this.overheadHeight = 20;
    this.setFOV( theConfig.gameplay.FOV );
    this.camera.position.z = this.overheadHeight;
    
  } else if ( this.mode === 2 ) {
    
    this.camera = this.cameraPerspective;
    this.camera.rotation.order = 'ZYX';
    
    // Overhead third person
    this.targetPositionLock = true;
    this.targetRotationLock = true;
    this.chaseCamHeight = 3;
    this.chaseCamDistance = 6;
    this.chaseCamTilt = 0.07;
    this.setFOV( theConfig.gameplay.FOV );
    
  } else if ( this.mode === 3 ) {
    
    this.camera = this.cameraPerspective;
    this.camera.rotation.order = 'ZYX';
    this.setFOV( theConfig.gameplay.FOV );
    
  }
};

// toggleMode ==================================================================
CamControl.prototype.toggleMode = function() {
  if ( this.mode < 3 ) {
    this.setMode( this.mode + 1 );
  } else {
    this.setMode( 0 );
  }
}

// update ======================================================================
// Called every frame
CamControl.prototype.update = function() {
  
  if ( this.mode === 0 ) {
    
    if ( this.targetPositionLock ) {
      this.camera.position.set( this.target.position.x, this.target.position.y, this.overheadHeight );
    }
    if ( this.targetRotationLock ) {
      this.camera.rotation.z = this.target.rotation.z;
    }
    
  } else if ( this.mode === 1 ) {
    
    if ( this.targetPositionLock ) {
      this.camera.position.set( this.target.position.x, this.target.position.y, this.overheadHeight );
      this.camera.lookAt( this.target.mesh.position );
    }
    if ( this.targetRotationLock ) {
      this.camera.rotation.z = this.target.rotation.z;
    }
    
  } else if ( this.mode === 2 ) {
    
    if ( this.targetRotationLock ) {
      this.camera.position.x = this.target.mesh.position.x + Math.sin( this.target.mesh.rotation.z ) * this.chaseCamDistance;
      this.camera.position.y = this.target.mesh.position.y - Math.cos( this.target.mesh.rotation.z ) * this.chaseCamDistance;
  		this.camera.position.z = this.target.mesh.position.z + this.chaseCamHeight;
  
      this.camera.rotation.z = this.target.mesh.rotation.z;
      this.camera.rotation.x = Math.atan( this.chaseCamDistance / this.chaseCamHeight ) + ( this.chaseCamTilt * Math.PI );
    } else {
      this.camera.position.x = this.target.mesh.position.x - this.chaseCamDistance;
      this.camera.position.y = this.target.mesh.position.y - this.chaseCamDistance;
    	this.camera.position.z = this.target.mesh.position.z + this.chaseCamHeight;
      
      this.camera.lookAt( this.target.mesh.position );
    }
    
  } else if ( this.mode === 3 ) {
    
    this.camera.position.x = this.target.mesh.position.x;
    this.camera.position.y = this.target.mesh.position.y;
		this.camera.position.z = this.target.mesh.position.z + ( this.target.size.z * 0.4 );

    this.camera.rotation.z = this.target.rotation.z;
    this.camera.rotation.x = this.target.rotation.x + ( 0.5 * Math.PI );
    
  }

};