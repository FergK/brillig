/* global THREE CANNON theWorld theScene X_AXIS Y_AXIS Z_AXIS*/
"use strict";

// =============================================================================
// ENTITY ======================================================================
// =============================================================================

function Entity( size, position, rotation ) {
  
  this.uuid = THREE.Math.generateUUID();

  this.size = ( size !== undefined ) ? size : new THREE.Vector3( 1, 1, 1 );
  this.position = ( position !== undefined ) ? position : new THREE.Vector3( 0, 0, ( this.size.z / 2 ) );
  this.rotation = ( rotation !== undefined ) ? rotation : new THREE.Euler( 0, 0, 0, 'XYZ' );

  this.mesh = new THREE.Mesh(
    new THREE.BoxGeometry( this.size.x, this.size.y, this.size.z ),
    new THREE.MeshLambertMaterial( { color: 0xFF00FF, wireframe: false } )
  );

  this.mesh.position.set( this.position.x, this.position.y, this.position.z );
  this.mesh.rotation.set( this.rotation.x, this.rotation.y, this.rotation.z );
  
  this.mesh.castShadow = true;
  this.mesh.receiveShadow = true;
  this.mesh.uuid = this.uuid;

  this.physics = {};
  this.physics.enabled = false;
  this.physics.contacts = [];
  
  // this.physics.helper = {};
  // this.physics.helper.enabled = false;
  
}
Entity.prototype.constructor = Entity;

// update ======================================================================
Entity.prototype.update = function() {
  if ( this.physics.enabled ) {
    this.position.copy( this.physics.body.position );
    this.rotation.setFromQuaternion( this.physics.body.quaternion );
  }
  
  this.mesh.position.set( this.position.x, this.position.y, this.position.z );
  this.mesh.rotation.set( this.rotation.x, this.rotation.y, this.rotation.z );
  
  this.onUpdate();
  
};

Entity.prototype.onUpdate = function() {};


// enablePhysics ===============================================================
Entity.prototype.enablePhysics = function( shape, size, mass, linearDamping, angularDamping ) {
  this.physics.enabled = true;
  
  if ( shape === 'sphere' ) {
    this.physics.shape = new CANNON.Sphere( size );
  } else if ( shape === 'cylinder' ) {
    this.physics.shape = new CANNON.Cylinder( size.x, size.x, size.z, 8 );
  } else if ( ( shape === 'box' ) || ( shape === undefined ) ) {
    this.physics.shape = new CANNON.Box( new CANNON.Vec3( size.x, size.y, size.z ) );
  }
  
  this.physics.mass = ( mass !== undefined ) ? mass : 1;
  this.physics.linearDamping = ( linearDamping !== undefined ) ? linearDamping : 1;
  this.physics.angularDamping = ( angularDamping !== undefined ) ? angularDamping : 1;
  
  this.physics.body = new CANNON.Body( { mass: this.physics.mass } );
  this.physics.body.addShape( this.physics.shape );
  
  this.physics.body.position.set( this.position.x, this.position.y, this.position.z );
  this.physics.body.quaternion.setFromEuler( this.rotation.x, this.rotation.y, this.rotation.z, 'XYZ');
  
  this.physics.body.collisionFilterGroup = 4;
    // Collision Group 4 is used for entities that will collide with the player and world
    // but player interaction rays won't hit them
  this.physics.body.collisionFilterMask = 1 | 2 | 4;
  
  this.physics.body.uuid = this.uuid;
  
  return this.physics.body;
  
};

// place ======================================================================
// Place the entity at a specific location
Entity.prototype.place = function( x, y, z ) {
  this.position.set( x, y, z );
	this.mesh.position.set( x, y, z );
	
  if ( this.physics.enabled ) { 
    this.physics.body.position.set( x, y, z );
  }
};

// rotate ======================================================================
// Rotate the entity to a specific euler angle
Entity.prototype.rotate = function( x, y, z ) {
  this.rotation.set( x, y, z );
  this.mesh.rotation.set( x, y, z );
  
  if ( this.physics.enabled ) { 
    this.physics.body.quaternion.setFromEuler( x, y, z, 'XYZ');
  }
  
};

// addToWorld ==================================================================
// Adds this entity to the world's entity list, scene, and physics if necessary
Entity.prototype.addToWorld = function() {
  
  theWorld.entities.push( this );
  theScene.add( this.mesh );
  
  if ( this.physics.enabled ) {
    theWorld.physics.add( this.physics.body );
  }
  
};

// addToPhysics ==================================================================
// Adds this entity only to the world physics
Entity.prototype.addToPhysics = function() {
  
  if ( this.physics.enabled ) {
    theWorld.physics.add( this.physics.body );
  }
  
};

// removeFromWorld =============================================================
// Removes this entity from the scene and physics, if applicable.
// theWorld must still remove it from the entities array after this is called
Entity.prototype.removeFromWorld = function() {
  
  theScene.remove( this.mesh );
  
  if ( this.physics.body !== undefined ) {
    theWorld.physics.removeBody( this.physics.body );
  }
  
};





// =============================================================================
// STATICENTITY ================================================================
// =============================================================================

function StaticEntity( shape, position, rotation ) {
  
  this.uuid = THREE.Math.generateUUID();
  
  this.position = ( position !== undefined ) ? position : new THREE.Vector3( 0, 0, 0 );
  this.rotation = ( rotation !== undefined ) ? rotation : new THREE.Euler( 0, 0, 0, 'XYZ' );
  
  this.shape = ( shape !== undefined ) ? shape : {};
  this.shape.type = ( shape.type !== undefined ) ? shape.type : 'box';
  this.shape.size = ( shape.size !== undefined ) ? shape.size : new THREE.Vector3( 1, 1, 1 );
  
  this.physics = {};
  this.physics.enabled = true;
  this.physics.contacts = [];
  
  this.physics.mass = 0;
  this.physics.linearDamping = 0;
  this.physics.angularDamping = 0;
  
  this.physics.body = new CANNON.Body( { mass: this.physics.mass } );
  this.physics.body.uuid = this.uuid;
  this.physics.body.properties = {};
  this.physics.body.properties.kind = null;
  
  switch ( shape.type ) {
    case "box":
      
      this.mesh = new THREE.Mesh(
        new THREE.BoxGeometry( shape.size.x, shape.size.y, shape.size.z ),
        new THREE.MeshLambertMaterial( { color: 0xFF00FF, wireframe: false } )
      );
      
      // Three.js uses full size lengths for box sizes, cannon.js uses half-extents
      this.physics.shape = new CANNON.Box( new CANNON.Vec3( shape.size.x / 2, shape.size.y / 2, shape.size.z / 2 ) );
      
      break;
      
    case "cylinder":
      
      this.mesh = new THREE.Mesh(
        new THREE.CylinderGeometry( shape.radiusTop, shape.radiusBottom, shape.height, shape.radiusSegments ),
        new THREE.MeshLambertMaterial( { color: 0xFF00FF, wireframe: false } )
      );
      
      this.physics.shape = new CANNON.Cylinder( shape.radiusTop, shape.radiusBottom, shape.height, shape.radiusSegments );
      
      break;
      
    case "sphere":
          
      this.mesh = new THREE.Mesh(
        new THREE.SphereGeometry( shape.radius, shape.segments, shape.segments ),
        new THREE.MeshLambertMaterial( { color: 0xFF00FF, wireframe: false } )
      );
      
      this.physics.shape = new CANNON.Sphere( shape.radius );
      
      break;
  }

  this.physics.body.addShape( this.physics.shape );
  
  this.physics.body.material = theWorld.physics.worldMaterial;
  this.physics.body.collisionFilterGroup = 1;
  this.physics.body.collisionFilterMask = 2 | 4; // Do not collide with self, otherwise massive performance issue
  this.physics.body.type = CANNON.STATIC;
  
  this.place( this.position.x, this.position.y, this.position.z );
  this.rotate( this.rotation.x, this.rotation.y, this.rotation.z );
  
  this.mesh.castShadow = true;
  this.mesh.receiveShadow = true;
  this.mesh.uuid = this.uuid;
  
  theWorld.entities.push( this );
  theScene.add( this.mesh );
  theWorld.physics.add( this.physics.body );
  
}
StaticEntity.prototype.constructor = StaticEntity;

// place ======================================================================
// Place the entity at a specific location
StaticEntity.prototype.place = function ( x, y, z ) {
  this.position.set( x, y, z );
	this.mesh.position.set( x, y, z );
  this.physics.body.position.set( x, y, z );
};

// rotate ======================================================================
// Rotate the entity to a specific euler angle
StaticEntity.prototype.rotate = function ( x, y, z ) {
  this.rotation.set( x, y, z );
  this.mesh.rotation.set( x, y, z );
  this.physics.body.quaternion.setFromEuler( x, y, z, 'XYZ');
  
  if ( this.shape.type === 'cylinder' ) {
    // var vec5 = new THREE.Vector3( 0, 1, 0 );
    // var vec6 = new THREE.Vector3( 0, 0, 1 );
    var c = new THREE.Quaternion().setFromUnitVectors( Y_AXIS, Z_AXIS );
    var d = new THREE.Quaternion().copy( this.physics.body.quaternion ).multiply( c );
    this.mesh.rotation.setFromQuaternion( d, 'XYZ' );
  }
};

// update ======================================================================
StaticEntity.prototype.update = function () {};

// removeFromWorld =============================================================
// Removes this entity from the scene and physics, if applicable.
// theWorld must still remove it from the entities array after this is called
StaticEntity.prototype.removeFromWorld = function() {
  theScene.remove( this.mesh );
  theWorld.physics.removeBody( this.physics.body );
};

// =============================================================================
// BuilderEntity ===============================================================
// =============================================================================

function BuilderEntity() {
  
  this.position = undefined;
  this.rotation = undefined;
  this.size = undefined;
  this.material = undefined;
  
  this.properties = {};
  this.properties.kind = 'undefinedBuilderEntity';
  
  this.physics = {};
  this.physics.enabled = false;
  // this.physics.contacts = [];
  
  this.mesh = undefined;
  
}
BuilderEntity.prototype.constructor = BuilderEntity;

// update ======================================================================
BuilderEntity.prototype.update = function () {};

// addMesh =====================================================================
BuilderEntity.prototype.addMesh = function ( newMesh ) {
  this.mesh = newMesh;
  this.mesh.castShadow = true;
  this.mesh.receiveShadow = true;
  this.mesh.uuid = this.uuid;
  this.mesh.position.copy( this.position );
  this.mesh.rotation.copy( this.rotation );
};

// addPhysics ==================================================================
BuilderEntity.prototype.addPhysics = function () {
  
  this.physics.enabled = true;
  this.physics.contacts = [];
  this.physics.body = new CANNON.Body( { mass: 0 } );
  this.physics.body.material = theWorld.physics.worldMaterial;
  this.physics.body.uuid = this.uuid;
  this.physics.body.properties = this.properties;
  this.physics.body.collisionFilterGroup = 1;
  this.physics.body.collisionFilterMask = 2 | 4; // Do not collide with self, otherwise massive performance issue
  this.physics.body.type = CANNON.STATIC;
  
  if ( this.physics.shape !== undefined ) {
    this.physics.body.addShape( this.physics.shape );
  } else if ( this.physics.shapes !== undefined ) {
    for ( var i = 0; i < this.physics.shapes.length; i++ ) {
      this.physics.body.addShape(
        this.physics.shapes[i][0],
        new CANNON.Vec3( this.physics.shapes[i][1].x, this.physics.shapes[i][1].y, this.physics.shapes[i][1].z )
      );
    }
  }
  
  this.physics.body.position.copy( this.position );
  this.physics.body.quaternion.setFromEuler( this.rotation.x, this.rotation.y, this.rotation.z, 'XYZ');

};

// addToWorld ==================================================================
BuilderEntity.prototype.addToWorld = function () {
  theWorld.entities.push( this );
  theScene.add( this.mesh );
  theWorld.physics.add( this.physics.body );
};

// removeFromWorld =============================================================
// Removes this entity from the scene and physics, if applicable.
// theWorld must still remove it from the entities array after this is called
BuilderEntity.prototype.removeFromWorld = function() {
  theScene.remove( this.mesh );
  theWorld.physics.removeBody( this.physics.body );
};



// =============================================================================
// WALL ========================================================================
// =============================================================================

function Wall( position, rotation, size, material ) {
  
  if (
    ( position === undefined ) ||
    ( rotation === undefined ) ||
    ( size === undefined ) ||
    ( material === undefined )
  ) {
    // All parameters are required
    return false;
  }
  
  this.uuid = THREE.Math.generateUUID();
  
  this.position = position;
  this.rotation = rotation;
  this.size = size;
  this.halfSize = new THREE.Vector3().copy( this.size ).multiplyScalar( 0.5 );
  this.material = material;
  
  this.properties = {};
  this.properties.kind = 'wall';
  this.properties.size = this.size;
  this.properties.halfSize = this.halfSize;
  this.properties.uuid = this.uuid;
  this.properties.self = this;
  
  this.physics = {};
  
  // An array of objects attached to or placed in the wall, such as doors
  this.children = [];
  
  this.mesh = undefined;
  this.buildMesh();
  
  // Three.js uses full size lengths for box sizes, cannon.js uses half-extents
  // this.physics.shape = new CANNON.Box( new CANNON.Vec3( this.halfSize.x, this.halfSize.y, this.halfSize.z ) );
  
	this.addToWorld();
	
}
Wall.prototype = new BuilderEntity();
Wall.prototype.constructor = Wall;

Wall.prototype.buildMesh = function () {
  // http://stackoverflow.com/questions/12749852/slicing-up-a-rectangle
  
  var intersectsWithoutEdges = function ( a, b ) {
    // Sort of works
    
    var intersectsX = false;
    var intersectsY = false;
    
    if (
      ( ( a.min.x > b.min.x ) && ( a.min.x < b.max.x ) ) || // a.min.x inside b x range
      ( ( a.max.x > b.min.x ) && ( a.max.x < b.max.x ) ) || // a.max.x inside b x range
      ( ( a.min.x < b.min.x ) && ( a.max.x > b.max.x ) ) || // a is bigger and overlapping b
      ( ( b.min.x < a.min.x ) && ( b.max.x > a.max.x ) ) // b is bigger and overlapping a
    ) {
      intersectsX = true;
    }
    
    if (
      ( ( a.min.y > b.min.y ) && ( a.min.y < b.max.y ) ) || // a.min.x inside b x range
      ( ( a.max.y > b.min.y ) && ( a.max.y < b.max.y ) ) || // a.max.x inside b x range
      ( ( a.min.y < b.min.y ) && ( a.max.y > b.max.y ) ) || // a is bigger and overlapping b
      ( ( b.min.y < a.min.y ) && ( b.max.y > a.max.y ) ) // b is bigger and overlapping a
    ) {
      intersectsY = true;
    }
    
    return intersectsX && intersectsY;
    
  };
  
  // Define the points that make the outside edges of the wall
  var wallVectors = [ // Must be in clockwise order
    new THREE.Vector2( -this.halfSize.x, this.halfSize.z ),
    new THREE.Vector2( this.halfSize.x, this.halfSize.z ),
    new THREE.Vector2( this.halfSize.x, -this.halfSize.z ),
    new THREE.Vector2( -this.halfSize.x, -this.halfSize.z )
  ];
  var wallBox = new THREE.Box2(
    new THREE.Vector2( -this.halfSize.x, -this.halfSize.z ),
    new THREE.Vector2( this.halfSize.x, this.halfSize.z )
  );
  var wallPath = new THREE.Path( wallVectors );
  var wallShape = wallPath.toShapes();
  
  // an array of y coords where the horizontal box borders could go
  var lines = [];
  
  // all points which are interesting
	// when determining where the corners of the generated rect could be
  var points = [];
  points = points.concat( wallVectors ); // add the 4 corners of the room to interesting points
  
  // Loop through all the children and define bounding boxes for each one
  var holeBoxes = []; // Used for the collision box generation
  var holes = []; // Used for the visible geometry generation
  for ( var i = 0; i < this.children.length; i++ ) {
    
    holes[i] = [ // Must be in counter-clockwise order
      new THREE.Vector2( -this.children[i].halfSize.x + this.children[i].offset.x + 0.0001, this.children[i].halfSize.z + this.children[i].offset.z - 0.0001 ),
      new THREE.Vector2( -this.children[i].halfSize.x + this.children[i].offset.x + 0.0001, -this.children[i].halfSize.z + this.children[i].offset.z + 0.0001 ),
      new THREE.Vector2( this.children[i].halfSize.x + this.children[i].offset.x - 0.0001, -this.children[i].halfSize.z + this.children[i].offset.z + 0.0001 ),
      new THREE.Vector2( this.children[i].halfSize.x + this.children[i].offset.x - 0.0001, this.children[i].halfSize.z + this.children[i].offset.z - 0.0001 )
    ];
    wallShape[0].holes.push( new THREE.Path( holes[i] ) );
    
    holeBoxes[i] = new THREE.Box2(
      new THREE.Vector2(
        -this.children[i].halfSize.x + this.children[i].offset.x,
        -this.children[i].halfSize.z + this.children[i].offset.z ),
      new THREE.Vector2( 
        this.children[i].halfSize.x + this.children[i].offset.x,
        this.children[i].halfSize.z + this.children[i].offset.z )
    );
  
    if ( !wallBox.containsBox( holeBoxes[i] ) ) {
      console.log( 'Hole is outside of wall' );
      return false;
    }
    
    // add the top and bottom y values to the possible line y-values
    lines.push( holeBoxes[i].max.y );
    lines.push( holeBoxes[i].min.y );
    
    // add the corners to the interesting points
    points.push( new THREE.Vector2( holeBoxes[i].min.x, holeBoxes[i].max.y ) );
    points.push( holeBoxes[i].max );
    points.push( holeBoxes[i].min );
    points.push( new THREE.Vector2( holeBoxes[i].max.x, holeBoxes[i].min.y ) );
    
    // original version checks for intersections between holeBoxes, don't need to do that here
    
  }
  
  for ( i = 0; i < lines.length; i++ ) {
    // add the points where the horizontal lines intersect with the wall's left and right edges
    points.push( new THREE.Vector2( wallBox.min.x, lines[i] ) );
    points.push( new THREE.Vector2( wallBox.max.x, lines[i] ) );
    
    var lineBox = new THREE.Box2(
      new THREE.Vector2( wallBox.min.x, lines[i] ),
      new THREE.Vector2( wallBox.max.x, lines[i] )
    );
    
    // add the points where the horizontal lines intersect with the holeBoxes
    for ( var j = 0; j < holeBoxes.length; j++ ) {
      if ( lineBox.isIntersectionBox( holeBoxes[j] ) ) {
        points.push( new THREE.Vector2( holeBoxes[j].min.x, lines[i] ) );
        points.push( new THREE.Vector2( holeBoxes[j].max.x, lines[i] ) );
      }
    }
  }
  
  // clamp all points that are outside of the room to the room edges // Doesn't seem necessary, did not implement
  
  // Remove duplicate points
  // TODO conver this to a hash thingy like below?
  var uniquePoints = [];
  uniquePoints[0] = points[0];
  for ( i = 1; i < points.length; i++ ) {
    var isUnique = true;
    for ( j = 0; j < uniquePoints.length; j++ ) {
      if ( points[i].equals( uniquePoints[j] ) ) {
        isUnique = false;
        break;
      }
    }
    if ( isUnique ) { 
      uniquePoints.push( points[i] );
    }
  }
  points = uniquePoints;
  
  // console.log( points );
  
  var pointsHash = {};
  for ( i = 0; i < points.length; i++ ) {
    pointsHash[ points[i].x + "_" + points[i].y ] = true;
  }
  
  // console.log( pointsHash );
  
  var boxes = []
  for ( var a = 0; a < points.length; a++ ) {
    for ( var b = 0; b < points.length; b++ ) {
      if (
        ( a !== b ) &&
        ( points[b].x > points[a].x ) &&
        ( points[b].y === points[a].y ) // Don't really understand this one
      ) {
        
        thisbox: for ( var c = 0; c < points.length; c++ ) {
          // generate a rectangle that has its four corners in our points of interest
  				if (
  				  ( c != b ) &&
  				  ( c != a ) &&
  				  ( points[c].y < points[b].y ) && // this different than the original do to flipped coords
  				  ( points[c].x === points[b].x )
  				) {
  				  var newBox = new THREE.Box2( 
              new THREE.Vector2( points[a].x, points[c].y ),
              new THREE.Vector2( points[b].x, points[b].y )
  				  );
  				  
  				  // check for duplicate boxes
  				  for ( j = 0; j < boxes.length; j++ ) {
  				    if ( newBox.equals( boxes[j] ) ) { continue thisbox; }
  				  }
  				  
  				  // make sure the rect has the bottom left corner in one of our points
						if ( pointsHash[ points[a].x + "_" + points[c].y ] ) {
						  // Check if this box intersects or contains any of the holeBoxes
						  var containsOrIntersects = false;
						  
						  // this scaledBox excludes intersects that only occur on the edges of the boxes
						  // TODO fix this ugly hack
						  var scaledBox = new THREE.Box2( 
                new THREE.Vector2( points[a].x, points[c].y ),
                new THREE.Vector2( points[b].x, points[b].y )
    				  ).expandByScalar( -0.0001 );
						  
              for ( j = 0; j < holeBoxes.length; j++ ) {
						    if ( newBox.containsBox( holeBoxes[j] ) ) {
						      // console.log( 'contains' );
						      containsOrIntersects = true;
									break;
						    // } else if ( intersectsWithoutEdges( newBox, holeBoxes[j] ) ) {
						    } else if ( scaledBox.isIntersectionBox( holeBoxes[j] ) ) {
						      // console.log( 'intersects' );
						      containsOrIntersects = true;
									break;
						    }
              }
						  
						  if ( !containsOrIntersects ) {
								boxes.push( newBox );
							}
						  
						}
  				}
        }
      }   
    }
  }
  
  // console.log( boxes );
  
  // Remove parents
  
  // Combine to slices
  
  // Remove stray rects
  
  // Loop through the boxes and generate a CANNON.js box shape for each one
  this.physics.shapes = [];
  for ( j = 0; j < boxes.length; j++ ) {
    
    // // if this box is flat, just skip it
    // if ( ( boxes[j].size().x === 0 ) || ( boxes[j].size().y === 0 ) ) {
    //   continue;
    // }

    this.physics.shapes.push( [
      new CANNON.Box( new CANNON.Vec3( boxes[j].size().x / 2, this.size.y / 2, boxes[j].size().y / 2 ) ),
      { x: boxes[j].center().x, y: 0, z: boxes[j].center().y }
    ] );
    
  }

  // Make the visible geometry by extruding the wall shape
  var newGeometry = new THREE.ExtrudeGeometry(
    wallShape, // Shape to be extruded
    { // Options object
      amount: this.size.y,
      bevelEnabled: false
    }
  );
	
  // The extruded geomety puts the original points at z=0, which means the mesh
  // is laying flat and off center, so we need to change the z values of the
  // vertices directly and rotate them with a matrix
  for ( i = 0; i < newGeometry.vertices.length; i++ ) {
    newGeometry.vertices[i].z -= this.halfSize.y;
  }
  var vertexRotationMatrix = new THREE.Matrix4().makeRotationFromQuaternion(
    new THREE.Quaternion().setFromUnitVectors( Y_AXIS, Z_AXIS )
  );
  newGeometry.applyMatrix( vertexRotationMatrix );
  
  var newMesh = new THREE.Mesh(
    newGeometry,
    this.material
  );
  
  // console.log( this.physics.shapes );
  
  if ( this.mesh === undefined ) {
    this.addMesh( newMesh );
    this.addPhysics();
  } else {
    theScene.remove( this.mesh );
    this.addMesh( newMesh );
    theScene.add( this.mesh );
    
    theWorld.physics.removeBody( this.physics.body );
    this.addPhysics();
    theWorld.physics.add( this.physics.body );
  }
  
  // console.log( this.physics.body );
  
  return newMesh;

};

// addChild =============================================================
Wall.prototype.addChild = function ( childObject ) {
  this.children.push( childObject );
  this.buildMesh();
};

// removeChild =============================================================
Wall.prototype.removeChild = function ( childObjectUUID ) {
  for ( var i = 0; i < this.children.length; i++ ) {
    if ( this.children[i].uuid === childObjectUUID ) {
      this.children.splice( i, 1 );
      this.buildMesh();
      return true;
    }
  }
  return false;
};

// removeFromWorld =============================================================
// Removes this wall (and all its children) from the scene and physics
Wall.prototype.removeFromWorld = function() {
  
  while ( this.children.length > 0 ) {
    theWorld.removeEntityByUUID( this.children[0].uuid );
  }
  
  theScene.remove( this.mesh );
  theWorld.physics.removeBody( this.physics.body );
};



// =============================================================================
// WALLINSET ===================================================================
// =============================================================================

function WallInset( position, rotation, size, properties, mesh ) {
  
  if (
    ( position === undefined ) ||
    ( rotation === undefined ) ||
    ( properties === undefined ) ||
    ( mesh === undefined )
  ) {
    // All parameters are required
    return false;
  }
  
  this.uuid = THREE.Math.generateUUID();
  
  this.position = position;
  this.rotation = rotation;
  this.size = size;
  
  this.properties = properties;
  this.properties.uuid = this.uuid;
  this.properties.self = this;
  
  // Three.js uses full size lengths for box sizes, cannon.js uses half-extents
  this.physics = {};
  this.physics.shape = new CANNON.Box( new CANNON.Vec3( this.properties.halfSize.x, this.properties.halfSize.y, this.properties.halfSize.z ) );
  this.addPhysics();
	this.physics.body.collisionFilterGroup = 8; // Collides only with the raycast
  // this.physics.body.collisionFilterMask = 0; // Do not collide with self, otherwise massive performance issue
  
  this.mesh = mesh;
  
  this.addToWorld();
	
  
}
WallInset.prototype = new BuilderEntity();
WallInset.prototype.constructor = WallInset;

// removeFromWorld =============================================================
// Removes this wall (and all its children) from the scene and physics
WallInset.prototype.removeFromWorld = function() {
  theScene.remove( this.mesh );
  theWorld.physics.removeBody( this.physics.body );
  this.properties.parent.removeChild( this.uuid );
};

// getProperties =============================================================
WallInset.prototype.getProperties = function() {
  return this.properties;
};