/* global THREE CANNON X_AXIS Y_AXIS Z_AXIS Toolset self thePlayer theWorld Entity*/
"use strict";

// =============================================================================
// EQUIPMENT ===================================================================
// =============================================================================

function Equipment() {
    
  var self = this;
  
  // Options ===================================================================
  
  this.equippedTool = 2;
  
  // Tool Objects ==============================================================
  
  this.emptyHanded = {};
  this.emptyHanded.name = "Empty Handed";
  this.emptyHanded.icon = "child";
  
  this.ballShooter = {};
  this.ballShooter.name = "Ball Shooter";
  this.ballShooter.icon = "futbol-o";
  this.ballShooter.whilePrimaryDown = function(){ self.shootBall() };
  this.ballShooter.force = 30;
  this.ballShooter.radius = 0.2;
  this.ballShooter.minDelay = 100; // ms
  this.ballShooter.ballLifespan = 10000; // seconds
  this.ballShooter.lastShot = 0;
  
  this.tools[1] = this.emptyHanded;
  this.tools[2] = this.ballShooter;
  
}
Equipment.prototype = new Toolset();
Equipment.prototype.constructor = Equipment;



// =============================================================================
// BALL SHOOTER ================================================================
// =============================================================================
Equipment.prototype.shootBall = function(  ) {

  var currentTime = Date.now();
  if ( ( currentTime - this.ballShooter.lastShot ) < this.ballShooter.minDelay ) { return false; }
  
  var shootVector = new THREE.Vector3( 0, 1, 0 );
  shootVector.applyAxisAngle( new THREE.Vector3( 1, 0, 0 ), thePlayer.rotation.x );
  shootVector.applyAxisAngle( new THREE.Vector3( 0, 0, 1 ), thePlayer.rotation.z );

  var ball = new Entity(
    new THREE.Vector3( 1, 1, 1 ),
    new THREE.Vector3(
      thePlayer.position.x + shootVector.x,
      thePlayer.position.y + shootVector.y,
      thePlayer.position.z + shootVector.z + ( thePlayer.size.z * 0.4 )
    )
  );
  ball.timeborn = currentTime;
  ball.ballLifespan = this.ballShooter.ballLifespan;
  ball.onUpdate = function () {
    if ( ( Date.now() - ball.timeborn ) > this.ballLifespan ) {
      theWorld.removeEntityByUUID( this.uuid );
    }
  };
  
  var randomColor  = new THREE.Color( THREE.Math.random16(), THREE.Math.random16(), THREE.Math.random16() );
  ball.mesh = new THREE.Mesh(
    new THREE.SphereGeometry( this.ballShooter.radius, 16, 16 ),
    new THREE.MeshLambertMaterial( { color: randomColor, wireframe: false, wrapAround: true } )
  );
  ball.mesh.receiveShadow = true;
  ball.mesh.castShadow = true;
  
  ball.enablePhysics( 'sphere', this.ballShooter.radius, 1, 0.1, 0.1 );
  ball.addToWorld();
    
  shootVector.multiplyScalar( this.ballShooter.force );
  ball.physics.body.applyLocalImpulse( new CANNON.Vec3( shootVector.x, shootVector.y, shootVector.z ), new CANNON.Vec3( 0, 0, 0 ) );
  
  this.ballShooter.lastShot = currentTime;
  
  return true;

};