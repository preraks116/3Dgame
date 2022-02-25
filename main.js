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

let keyPressed = {
  "w" : 0,
  "a" : 0,
  "s" : 0,
  "d" : 0,
  "space" : 0
}

const loader = new GLTFLoader();

function random(min, max) {
  return Math.random() * (max - min) + min;
}

// initial vector looking at the sun
let shipForward = new THREE.Vector3(0, 0, -1);

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
      if(this.speed.vel)
      {
        camera.position.sub(shipForward.clone().multiplyScalar(-1*this.speed.vel))
      }
      if(this.speed.rot)
      {
        cameravector.applyAxisAngle(new Vector3(0,1,0), boat.speed.rot)
        // rotate shipForward
        shipForward.applyAxisAngle(new Vector3(0,1,0), boat.speed.rot)
        camera.position.x = boat.boat.position.x + cameravector.x
        camera.position.y = boat.boat.position.y + cameravector.y
        camera.position.z = boat.boat.position.z + cameravector.z
        camera.lookAt(boat.boat.position)
      }
      this.boat.rotation.y += this.speed.rot
      this.boat.translateZ(-1*this.speed.vel)
    }
  }
}

const boat = new Boat()



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

  scene.add( water );

  // Skybox

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

  const pmremGenerator = new THREE.PMREMGenerator( renderer );

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
    keyPressed[e.key] = 1
  })
  window.addEventListener( 'keyup', function(e){
    boat.stop()
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
  if(boat.boat){
    trashes.forEach(trash => {
      if(trash.trash){
        if(isColliding(boat.boat, trash.trash)){
          scene.remove(trash.trash)
          if(trash.collected === 0)
          {
            score +=1
            trash.collected = 1
            console.log(score)
          }
        }
      }
    })
  }
}

function resetbools(){
  for(let key in keyPressed){
    keyPressed[key] = 0
  }
}

function animate() {
  requestAnimationFrame(animate);
  render();
  checkCollisions()
  // console.log(keyPressed.w)
  if(keyPressed.w)
  {
    boat.speed.vel = 1
  }
  if(keyPressed.s)
  {
    boat.speed.vel = -1
  }
  if(keyPressed.a)
  {
    boat.speed.rot = 0.1
  }
  if(keyPressed.d)
  {
    boat.speed.rot = -0.1
  }
  boat.update()
  resetbools()

  time++;
  if(time % 60 == 0)
  {
    //change inner html
    document.getElementById("time").innerHTML = "Time: " + time/60 + "s"
  }
  document.getElementById("score").innerHTML = "Score: " + score
}

function render() {
  water.material.uniforms[ 'time' ].value += 1.0 / 60.0;

  renderer.render( scene, camera );

}

init();
animate();
