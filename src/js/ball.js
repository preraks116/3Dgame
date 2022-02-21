const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const geometry = new THREE.SphereGeometry();
const material = new THREE.MeshPhongMaterial({color: 0x44aa88});
const ball = new THREE.Mesh( geometry, material );
scene.add( ball );

camera.position.z = 5;


const color = 0xFFFFFF;
const intensity = 1;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(-1, 2, 4);
scene.add(light);

var velocity = 0.0;
var acceleration = -0.005;

var ctr = 0;

function animate() {
	requestAnimationFrame( animate );

	ball.position.y += velocity;

	velocity += acceleration;

	if (ball.position.y <= -2.0) {
		velocity *= -1.0;
	}

	if (ball.position.y >= 0.0 && ctr == 0) {
		velocity = 0.0;
		ctr += 1;
	}

	if (ctr > 0) {
		if (ctr < 10) {
			ctr += 1;
		}
		else {
			ctr = 0;
		}
	}

	renderer.render( scene, camera );
};

animate();