/* global THREE CANNON theScene Entity StaticEntity theTimeDelta theViewport thePlayer */
"use strict";

// =============================================================================
// WORLD =======================================================================
// =============================================================================
// A class containing all the interacting elements of the game scene

function World() {

  this.lighting = {};
  
  // Fog
  this.lighting.fog = new THREE.Fog( 0x82aef3, 20, 400 );

  // Lighting
  this.lighting.sunlight = {};
  this.lighting.sunlight.color = new THREE.Color( 0xfff0c7 );
  this.lighting.sunlight.intensity = 0.9;
  this.lighting.sunlight.indirectIntensity = 0.2;
  this.lighting.sunlight.position = new THREE.Vector3( 2.5, -1.5, 4 );
  
  this.lighting.sunlight.direct = new THREE.DirectionalLight( this.lighting.sunlight.color, this.lighting.sunlight.intensity );
  this.lighting.sunlight.direct.position.copy( this.lighting.sunlight.position );
  
  this.lighting.sunlight.indirect = new THREE.DirectionalLight( this.lighting.sunlight.color, this.lighting.sunlight.intensity * this.lighting.sunlight.indirectIntensity );
  this.lighting.sunlight.indirect.position.copy( this.lighting.sunlight.position.clone().multiplyScalar( -1 ) );
  this.lighting.sunlight.indirect.position.z = 0;
  
  // this.lighting.hemilight = new THREE.HemisphereLight( 0x82aef3, 0x3c522f, 0.7 );
  this.lighting.hemilight = new THREE.HemisphereLight( 0x82aef3, 0x435241, 0.7 );
  
  this.lighting.hemilight.position.set( 0, 0, 100 );
  
  // Shadows
  this.lighting.shadow = {};
  this.lighting.shadow.radius = 30;
  this.lighting.shadow.resolution = 4096;
  this.lighting.shadow.position = this.lighting.sunlight.position.clone().setLength( 100 );
  
  this.lighting.shadow.light = new THREE.DirectionalLight( 0x000000, 0 );
  
  this.lighting.shadow.light.position.copy( this.lighting.shadow.position );
  this.lighting.shadow.light.target.position.set( 0, 0, 0 );
  
  this.lighting.shadow.light.onlyShadow = true;
  this.lighting.shadow.light.castShadow = true;
  this.lighting.shadow.light.shadowCameraVisible = false;
  this.lighting.shadow.light.shadowBias = 0.00001;
  this.lighting.shadow.light.shadowDarkness = 0.1;//0.2;
  
  this.lighting.shadow.light.shadowCameraNear = 1;
  this.lighting.shadow.light.shadowCameraFar = 500;
  this.lighting.shadow.light.shadowCameraRight = this.lighting.shadow.radius;
  this.lighting.shadow.light.shadowCameraLeft = -this.lighting.shadow.radius;
  this.lighting.shadow.light.shadowCameraTop = this.lighting.shadow.radius;
  this.lighting.shadow.light.shadowCameraBottom = -this.lighting.shadow.radius;
  this.lighting.shadow.light.shadowMapWidth = this.lighting.shadow.resolution;
  this.lighting.shadow.light.shadowMapHeight = this.lighting.shadow.resolution;
  
  // Physics
  this.physics = new CANNON.World();
  this.physics.fixedTimeStep = ( 1 / 120 ); // Run physics twice per frame and interpolate for smooth motion
  this.physics.broadphase = new CANNON.NaiveBroadphase();
  this.physics.solver = new CANNON.SplitSolver( new CANNON.GSSolver() );
  this.physics.solver.iterations = 5;
  this.physics.solver.tolerance = 0.01;
  
  this.physics.gravity.set( 0, 0, -25 );

  this.physics.worldMaterial = new CANNON.Material( { 
    name: "worldMaterial",
    friction: 0.5
    // restitution: 0.0
  });
  
  this.physics.playerMaterial = new CANNON.Material( "playerMaterial" );
  
  var worldToWorld = new CANNON.ContactMaterial(
    this.physics.worldMaterial,
    this.physics.worldMaterial,
    {
      friction: 0.5,
      restitution: 0.0,
      contactEquationStiffness: 1e8,
      contactEquationRelaxation: 3,
      frictionEquationStiffness: 1e8,
      frictionEquationRegularizationTime: 3
    }
  );
  this.physics.addContactMaterial( worldToWorld );
  
  var playerToWorld = new CANNON.ContactMaterial(
    this.physics.worldMaterial,
    this.physics.playerMaterial,
    {
      friction: 0.0, // friction coefficient
      restitution: 0.0  // restitution
      // contactEquationStiffness: 1e9,
      // contactEquationRelaxation: 3,
      // frictionEquationStiffness: 1e9,
      // frictionEquationRegularizationTime: 3
    }
  );
  this.physics.addContactMaterial( playerToWorld );
  
  this.entities = [];
  
}
World.prototype.constructor = World;

// setScene ====================================================================
// Takes all the lighting values and applies them to the threejs scene
// as well as initializing the world entities
World.prototype.setScene = function() {

  theScene.fog = this.lighting.fog;

  theScene.add( this.lighting.sunlight.direct );
  theScene.add( this.lighting.sunlight.indirect );
  theScene.add( this.lighting.hemilight );
  theScene.add( this.lighting.shadow.light );
  
  // This is a THREE.js geometry that will hold the all the static world geometry in one object
  // This is a performance optimization for rendering
  var worldGeometry = new THREE.Geometry();
  
  // Add the ground
  var ground; 
  ground = new Entity( new THREE.Vector3( 200, 200, 0.2 ) );
  
  ground.mesh = new THREE.Mesh(
    new THREE.BoxGeometry( ground.size.x, ground.size.y, ground.size.z ),
    new THREE.MeshLambertMaterial( { 
      // color: 0x9ab54a, // Default ground color
      color: 0xFFFFFF,
      wireframe: false,
      map: THREE.ImageUtils.loadTexture('res/groundGrid.bmp')
      
    } )
  );
  ground.mesh.material.map.repeat = new THREE.Vector2( ground.size.x, ground.size.y );
  ground.mesh.material.map.wrapS = THREE.RepeatWrapping;
  ground.mesh.material.map.wrapT = THREE.RepeatWrapping;
  ground.mesh.material.map.magFilter = THREE.NearestFilter;
  // ground.mesh.material.map.anisotropy = 16;
  
  ground.place( ground.position.x, ground.position.y, -0.1 );
  ground.mesh.receiveShadow = true;
  theScene.add( ground.mesh );
  
  var groundShape = new CANNON.Plane();
  var groundBody = new CANNON.Body( { mass: 0, material: this.physics.worldMaterial } );
  groundBody.addShape( groundShape );
  groundBody.position.set( 0, 0, 0 );
  groundBody.collisionFilterGroup = 1;
  groundBody.collisionFilterMask = 1 | 2 | 4;
  this.physics.add( groundBody );
  
  //==========================
  
  // var pSphere = new Entity( new THREE.Vector3( 1, 1, 1 ) );
  
  // pSphere.mesh = new THREE.Mesh(
  //   new THREE.SphereGeometry( 0.5, 12, 12 ),
  //   new THREE.MeshLambertMaterial( { color: 0xFFFFFF, wireframe: true, wrapAround: true } )
  // );
  // pSphere.mesh.castShadow = true;
  // pSphere.mesh.receiveShadow = true;
  
  // pSphere.enablePhysics( 'sphere', 0.5, 10, 0.9, 0.9 );
  // pSphere.physics.body.material = this.physics.worldMaterial;
  // pSphere.place( THREE.Math.randFloatSpread( 1 ), THREE.Math.randFloatSpread( 1 ), 10 );
  // pSphere.addToWorld();
  
  // // Let's load in some rectangular buildings
  for( var i = 0; i < 50; i++ ) {
    
    // var boxEntitySize = new THREE.Vector3( 10, 10, THREE.Math.randFloat( 1, 50 ) );
    // var boxEntity = new StaticEntity(
    //   {
    //     type: 'box',
    //     size: boxEntitySize
    //   },
    //   new THREE.Vector3( THREE.Math.randInt( -100, 100 ), THREE.Math.randInt( -100, 100 ), boxEntitySize.z / 2 ), // Position
    //   new THREE.Euler( 0, 0, 0, 'XYZ' ) // Rotation
    //   // new THREE.Vector3( THREE.Math.randInt( -100, 100 ), THREE.Math.randInt( -100, 100 ), boxEntitySize.z / 2 ), // Position
    //   // new THREE.Euler( THREE.Math.randFloatSpread( Math.PI / 8 ), THREE.Math.randFloatSpread( Math.PI / 8 ), THREE.Math.randFloatSpread( Math.PI / 2 ), 'XYZ' ) // Rotation
    // );
    // boxEntity.mesh.material = new THREE.MeshLambertMaterial( { color: 0xAAAAAA, wireframe: false } );
    
    // var sphereEntity = new StaticEntity(
    //   {
    //     type: 'sphere',
    //     radius: 2.5,
    //     segments: 32
    //   },
    //   new THREE.Vector3( THREE.Math.randInt( -100, 100 ), THREE.Math.randInt( -100, 100 ), 2.5 )
    // );
    // sphereEntity.mesh.material = new THREE.MeshLambertMaterial( { color: 0xAAAAAA, wireframe: false } );
    
    // Code for combining world geometry for performance
    // boxEntity.mesh.matrixAutoUpdate = false;
	  // boxEntity.mesh.updateMatrix();
    // worldGeometry.merge( boxEntity.mesh.geometry, boxEntity.mesh.matrix, 1 );
    
  }
  
  // Code for combining world geometry for performance
  // var worldMesh = new THREE.Mesh(
  //   worldGeometry,
  //   new THREE.MeshLambertMaterial( { color: 0xAAAAAA, wireframe: false } )
  // );
  // worldMesh.castShadow = true;
  // worldMesh.receiveShadow = true;
  // theScene.add( worldMesh );

};

World.prototype.update = function() {

  // TODO fix the bug that causes exagerated forces when you pause the render 
  //      (like by switching tabs)

  // if( theTimeDelta > 0.1 ) {
  //   // The simulation was paused or the frame was too low
  //   // so we'll just do a simple step instead of interpolating anything
  //   this.physics.step( this.physics.fixedTimeStep, this.physics.fixedTimeStep );
  // } else {
    this.physics.step( this.physics.fixedTimeStep, theTimeDelta );
  // }
  
  for( var i = 0; i < this.entities.length; i++ ) {
    
    if ( ( this.entities[i].physics.enabled ) && ( this.entities[i].physics.body.mass > 0 ) ) {
      
      // Custom code for reporting currently occuring collisions to each entity.
      // This works better than the built in cannon.js collide event because that only
      // occurs once per collision. The way, you can check if the collision is
      // still occuring at any time after that.
      this.entities[i].physics.contacts = [];
      for( var j = 0; j < this.physics.contacts.length; j++ ) {
        if (
          ( this.physics.contacts[j].bi.id === this.entities[i].physics.body.id ) ||
          ( this.physics.contacts[j].bj.id === this.entities[i].physics.body.id )
        ) {
          this.entities[i].physics.contacts.push( this.physics.contacts[j] );
        }
      }
    
    }
      
    this.entities[i].update();
  }
  
  // Update the shadows based on the player position
  this.lighting.shadow.light.position.set(
    thePlayer.position.x + this.lighting.shadow.position.x,
    thePlayer.position.y + this.lighting.shadow.position.y,
    thePlayer.position.z + this.lighting.shadow.position.z
  );
  this.lighting.shadow.light.target = thePlayer.mesh;
  
};

World.prototype.removeEntityByUUID = function( uuid ) {
  
  for( var i = 0; i < this.entities.length; i++ ) {
    
    if ( this.entities[i].uuid === uuid ) {
      this.entities[i].removeFromWorld();
      this.entities.splice( i, 1 );
      return true;
    }
    
  }
  
  return false;
  
};