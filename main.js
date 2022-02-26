import './style.css'


import * as THREE from 'three';

import { Water } from 'three/examples/jsm/objects/Water.js';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { Vector3 } from 'three';

let camera, scene, renderer;
let water, sun;
let score = 0;
let time = 0;
let health = 100;

let keyPressed = {
  "w": {
    "pressed": 0,
    f: () => {
      PlayerBoat.speed.vel = 1
    }
  },
  "a": {
    "pressed": 0,
    f: () => {
      PlayerBoat.speed.rot = 0.1
    }
  },
  "s": {
    "pressed": 0,
    f: () => {
      PlayerBoat.speed.vel = -1
    }
  },
  "d": {
    "pressed": 0,
    f: () => {
      PlayerBoat.speed.rot = -0.1
    }
  },
  "h": {
    "pressed": 0,
    f: () => {
      // cannonBallList.push(new cannonBall(PlayerBoat.boat.position.x + ballOffset.x,PlayerBoat.boat.position.y,PlayerBoat.boat.position.z + ballOffset.z));
      cannonBallList.push(new cannonBall(PlayerBoat.boat.position.x,PlayerBoat.boat.position.y,PlayerBoat.boat.position.z));

    }
  }
}

const ballOffset = {
  "x": 150,
  "z": 780
}

const loader = new GLTFLoader();

function random(min, max) {
  return Math.random() * (max - min) + min;
}

// initial vector looking at the sun
let shipForward = new THREE.Vector3(0, 0, -1);

function updatecamera(){
  if(PlayerBoat.speed.vel)
  {
    camera.position.sub(shipForward.clone().multiplyScalar(-1*PlayerBoat.speed.vel))
  }
  if(PlayerBoat.speed.rot)
  {
    cameravector.applyAxisAngle(new Vector3(0,1,0), PlayerBoat.speed.rot)
    // rotate shipForward
    shipForward.applyAxisAngle(new Vector3(0,1,0), PlayerBoat.speed.rot)
    camera.position.x = PlayerBoat.boat.position.x + cameravector.x
    camera.position.y = PlayerBoat.boat.position.y + cameravector.y
    camera.position.z = PlayerBoat.boat.position.z + cameravector.z
    camera.lookAt(PlayerBoat.boat.position)
  }
}

class Boat {
  constructor(){
    loader.load("assets/boat/scene2.gltf", (gltf) => {
      scene.add(gltf.scene)
      gltf.scene.scale.set(5, 5, 5)
      gltf.scene.position.set(0,-1.5,-80)
      this.boat = gltf.scene
      this.speed = {
        vel: 0,
        rot: 0
      }
    })
  }

  stop(){
    this.speed.vel = 0
    this.speed.rot = 0
  }

  update(){
    if(this.boat){
      updatecamera();
      this.boat.rotation.y += this.speed.rot
      this.boat.translateZ(-1*this.speed.vel)
    }
  }
}

//function to get random angle between 0 and 2*PI
function getRandomAngle(){
  return Math.random() * 2 * Math.PI
}

let enemySpeed = -0.1


class cannonBall {
  constructor(x,y,z){
    console.log(x,y,z) 
    loader.load("assets/cannonBall/untitled.gltf", (gltf) => {
      scene.add(gltf.scene)
      gltf.scene.scale.set(100, 100, 100)
      gltf.scene.position.set(x,5,z)
      // gltf.scene.rotateOnAxis(new Vector3(0,1,0), getRandomAngle())
      // ball should move in the direction of shipForward
      // gltf.scene.rotateOnAxis(new Vector3(0,1,0), getRandomAngle())
      let angle = Math.atan(PlayerBoat.boat.position.z/PlayerBoat.boat.position.x)
      console.log(angle)
      gltf.scene.lookAt(PlayerBoat.boat.position)
      
      gltf.scene.rotateOnAxis(new Vector3(1,0,0), Math.PI/2)
      this.ball = gltf.scene
      this.destroyed = 0
      this.speed = {
        vel: 1,
        rot: 0
      }
    })
  }

  stop(){
    this.speed.vel = 0
    this.speed.rot = 0
  }

  update(){
    if(this.ball){
      // console.log(this.speed.vel)
      // if(this.destroyed == 0)
      // {
      //   let distance = Math.sqrt(Math.pow(this.ball.position.x - PlayerBoat.boat.position.x,2) + Math.pow(this.ball.position.z - PlayerBoat.boat.position.z,2))
      //   if(distance > 1000)
      //   {
      //     this.speed.vel = 0
      //     scene.remove(this.ball)
      //   }
      // }
      this.ball.translateZ(-1*this.speed.vel)
    }
  }
}

let cannonBallList = []

// creating an ememy boat class 
class Enemy {
  constructor(){
    loader.load("assets/boat/ship_wreck.gltf", (gltf) => {
      let i = enemyList.length
      scene.add(gltf.scene)
      gltf.scene.scale.set(3, 3, 3)
      let angle = getRandomAngle()
      console.log(angle)
      let x = PlayerBoat.boat.position.x + 200*(Math.cos(angle))
      let z = PlayerBoat.boat.position.z + 200*(Math.sin(angle))
      gltf.scene.position.set(x,-1.5,z)
      this.boat = gltf.scene
      this.destroyed = 0
      this.speed = {
        vel: 0,
        rot: 0
      }
    })
  }

  stop(){
    this.speed.vel = 0
    this.speed.rot = 0
  }

  update(){
    if(this.boat){
      this.boat.lookAt(PlayerBoat.boat.position)
      this.boat.rotateY(Math.PI/2)
      this.boat.translateX(enemySpeed)
      // check distance of boat from player
      let distance = Math.sqrt(Math.pow(this.boat.position.x - PlayerBoat.boat.position.x, 2) + Math.pow(this.boat.position.z - PlayerBoat.boat.position.z, 2))
      // console.log(distance)
      if(distance < 100){
        // const cannonball = new cannonBall(this.boat.position.x, this.boat.position.y, this.boat.position.z)
        // cannonBallList.push(cannonball)
      }
    }
  }
}


const PlayerBoat = new Boat()
// const ball = new cannonBall(10,5,-80)
// cannonBallList.push(ball)


let enemyList = []
const enemy = new Enemy()
enemyList.push(enemy) 

class Trash{
  constructor(_scene){
    scene.add( _scene )
    _scene.scale.set(7, 7, 7)
    if(Math.random() > .6){
      _scene.position.set(random(-100, 100), -1, random(-100, 100))
    }else{
      _scene.position.set(random(-500, 500), -1, random(-1000, 1000))
    }
    this.collected = 0
    this.trash = _scene
    
  }
}

async function loadModel(url){
  return new Promise((resolve, reject) => {
    loader.load(url, (gltf) => {
      resolve(gltf.scene)
    })
  })
}

let boatModel = null
async function createTrash(){
  if(!boatModel){
    boatModel = await loadModel("assets/trash/scene.gltf")
  }
  return new Trash(boatModel.clone())
}

let trashes = []
const TRASH_COUNT = 50
let cameravector = new THREE.Vector3(0, 35.5, 80)



async function init() {
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  document.body.appendChild( renderer.domElement );

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 1, 20000 );
  camera.position.set( 0, 35, 0 );
  camera.lookAt( 0,-1.5,-80 );

  sun = new THREE.Vector3();

  const waterGeometry = new THREE.PlaneGeometry( 10000, 10000 );

  water = new Water(
    waterGeometry,
    {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: new THREE.TextureLoader().load( 'assets/waternormals.jpg', function ( texture ) {

        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

      } ),
      sunDirection: new THREE.Vector3(),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
      fog: scene.fog !== undefined
    }
  );

  water.rotation.x = - Math.PI / 2;

  scene.add(water);

  const sky = new Sky();
  sky.scale.setScalar(10000);
  scene.add(sky);

  const skyUniforms = sky.material. uniforms;

  skyUniforms[ 'turbidity' ].value = 10;
  skyUniforms[ 'rayleigh' ].value = 2;
  skyUniforms[ 'mieCoefficient' ].value = 0.005;
  skyUniforms[ 'mieDirectionalG' ].value = 0.8;

  const parameters = {
    elevation: 2,
    azimuth: 180
  };

  const pmremGenerator = new THREE.PMREMGenerator(renderer);

  function updateSun() {

    const phi = THREE.MathUtils.degToRad( 90 - parameters.elevation );
    const theta = THREE.MathUtils.degToRad( parameters.azimuth );

    sun.setFromSphericalCoords( 1, phi, theta );

    sky.material.uniforms[ 'sunPosition' ].value.copy( sun );
    water.material.uniforms[ 'sunDirection' ].value.copy( sun ).normalize();

    scene.environment = pmremGenerator.fromScene( sky ).texture;

  }

  updateSun();

  const waterUniforms = water.material.uniforms;

  for(let i = 0; i < TRASH_COUNT; i++){
    const trash = await createTrash()
    trashes.push(trash)
  }

  window.addEventListener( 'resize', onWindowResize );

  window.addEventListener( 'keydown', function(e){
    if(e.key in keyPressed)
    {
      keyPressed[e.key].pressed = 1
    }
  })

  window.addEventListener( 'keyup', function(e){
    PlayerBoat.stop()
  })
}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function isColliding(obj1, obj2){
  return (
    Math.abs(obj1.position.x - obj2.position.x) < 10 &&
    Math.abs(obj1.position.z - obj2.position.z) < 10
  )
}

function checkCollisions(){
  if(PlayerBoat.boat){
    trashes.forEach(trash => {
      if(trash.trash){
        if(isColliding(PlayerBoat.boat, trash.trash)){
          scene.remove(trash.trash)
          if(trash.collected === 0)
          {
            score +=1
            trash.collected = 1
          }
        }
      }
    })

    enemyList.forEach(enemy => {
      if(enemy.boat){
        if(isColliding(PlayerBoat.boat, enemy.boat)){
          scene.remove(enemy.boat)
          if(enemy.destroyed === 0)
          {
            health -= 25
            enemy.destroyed = 1
          }
        }
      }
    })

    // cannonBallList.forEach(cannonBall => {
    //   if(cannonBall.ball){
    //     if(isColliding(PlayerBoat.boat, cannonBall.ball)){
    //       scene.remove(cannonBall.ball)
    //       if(cannonBall.destroyed === 0)
    //       {
    //         health -= 10
    //         cannonBall.destroyed = 1
    //       }
    //     }

    //     enemyList.forEach(enemy => {
    //       if(enemy.boat){
    //         if(isColliding(cannonBall.ball, enemy.boat)){
    //           scene.remove(enemy.boat)
    //           if(enemy.destroyed === 0)
    //           {
    //             enemy.destroyed = 1
    //           }
    //         }
    //       }
    //     })
    //   }
    // })
  }
}

function resetbools(){
  for(let key in keyPressed){
    keyPressed[key].pressed = 0
  }
}

function setbools(){
  for (let key in keyPressed) {
    if (keyPressed[key]["pressed"]) {
      keyPressed[key].f();
    }
  }
}

function updatehud(){
  time++;
  if(time % 60 == 0)
  {
    // console.log(time)
    //change inner html
    document.getElementById("time").innerHTML = "Time: " + time/60 + "s"
  }
  document.getElementById("health").innerHTML = "Health: " + health
  document.getElementById("score").innerHTML = "Score: " + score
}

function updateEnemies(){
  if((time % (1800)) == 0)
  {
    const enemy = new Enemy()
    enemyList.push(enemy) 
    enemySpeed -= 0.05
  }
  enemyList.forEach(enemy => {
    enemy.update();
  })
}

function updateBalls(){
  cannonBallList.forEach(ball => {
    ball.update();
  })
}

function animate() {
  requestAnimationFrame(animate);
  render();
  checkCollisions();
  setbools();
  PlayerBoat.update();
  resetbools();
  updatehud();
  updateEnemies();
  updateBalls();
}

function render() {
  water.material.uniforms[ 'time' ].value += 1.0 / 60.0;
  renderer.render( scene, camera );
}

init();

animate();
