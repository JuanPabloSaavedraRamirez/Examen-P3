import * as THREE from 'three';
//import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'

function doThreeJS(){
  
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
  let maxHeight = 7;

  //Color fondo
  scene.background = new THREE.Color(0.25,0.6,0.95);
  scene.fog = new THREE.Fog(0x777777, 1, 35);

  //Luz ambiental
  const ambientLight = new THREE.AmbientLight(0xe0e0e0,1);
  scene.add(ambientLight);
  
  //Luz direccional
  const light = new THREE.DirectionalLight(0xffffff,0.6);
  light.position.set(0,4,2);
  scene.add(light);
  


  const renderer = new THREE.WebGLRenderer();
  renderer.toneMapping = THREE.ACESFilmicToneMapping; //opciones aestethic
  renderer.outputColorSpace = THREE.SRGBColorSpace; //opciones aestethic
  renderer.setPixelRatio(window.devicePixelRatio); //opciones aestethic
  renderer.toneMappingExposure = 0.3;
  renderer.setSize( window.innerWidth, window.innerHeight );

  //const controls = new OrbitControls( camera, renderer.domElement );

  document.body.appendChild( renderer.domElement );

  const loader = new RGBELoader();
  loader.load(
    'public/kloppenheim_02_1k.hdr',
    function(texture){
      texture.mapping = THREE.EquirectangularRefractionMapping;
      scene.environment = texture; //la pone grobal en el mapa environments 
  })

  const jpgloader = new THREE.TextureLoader();
  jpgloader.load(
    'public/kloppenheim_02.jpg',
    (texture) => {
      texture.mapping = THREE.EquirectangularRefractionMapping;
      scene.background = texture;
    }
  )

  camera.position.z = 5;
  
  const geometry = new THREE.SphereGeometry(1, 32, 32);
  const material = new THREE.MeshStandardMaterial({ 
    color: 0x888888,
    metalness:1,
    roughness:0.1,
  })
  const sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);
  camera.position.z = 5;
  sphere.position.set(0,0,0)

  camera.position.z = 15;
  
  // la gravedad
  let velocity = 0;
  let isJumping = false;
  
    function jump() {
      if (!isJumping && sphere.position.y < maxHeight) {
          isJumping = true;
          velocity = 0.1;
          setTimeout(() => {
              isJumping = false;
          }, 100);
      }
  }
  
  const obstacles:any[] = [];

  function createObstacle() {
    const gapHeight = 5; // Espacio entre los obstáculos

    // Obstáculo superior
    const upperRadiusTop = Math.random() * 1 + 1;
    const upperRadiusBottom = Math.random() * 1 + 1;
    const upperHeight = Math.random() * 3 + 2; // Variación de altura (aleatoria)
    const upperGeometry = new THREE.CylinderGeometry(upperRadiusTop, upperRadiusBottom, upperHeight, 32);
    const upperMaterial = new THREE.MeshStandardMaterial({ color: '#353535f6' });
    const upperObstacle = new THREE.Mesh(upperGeometry, upperMaterial);
    upperObstacle.position.set(10, (upperHeight / 2) + gapHeight / Math.random()/3, 0); // Posición ajustada
    scene.add(upperObstacle);
    upperObstacle.castShadow = true;
    obstacles.push(upperObstacle);
    
    // Obstáculo inferior
    const lowerRadiusTop = Math.random() * 1 + 1;
    const lowerRadiusBottom = Math.random() * 1 + 1;
    const lowerHeight = Math.random() * 3 + 2; // Variación de altura (aleatoria)
    const lowerGeometry = new THREE.CylinderGeometry(lowerRadiusTop, lowerRadiusBottom, lowerHeight, 32);
    const lowerMaterial = new THREE.MeshStandardMaterial({ color: '#353535f6' });
    const lowerObstacle = new THREE.Mesh(lowerGeometry, lowerMaterial);
    lowerObstacle.position.set(10, -((lowerHeight / 2) + gapHeight / 10), 0); // Posición ajustada
    scene.add(lowerObstacle);
    lowerObstacle.castShadow = true;
    obstacles.push(lowerObstacle);
}

  setInterval(createObstacle, 3000); 
  
  


  let score:number = 0;
  let maxScore:any = localStorage.getItem('maxScore') || 0;

  // Agregar elementos HTML para mostrar el puntaje
  const scoreElement = document.createElement('div');
  scoreElement.innerText = `Score  : ${score}`
  scoreElement.style.position = 'absolute';
  scoreElement.style.top = '10px';
  scoreElement.style.left = '10px';
  scoreElement.style.color = 'white';
  scoreElement.style.fontFamily = 'Arial';
  document.body.appendChild(scoreElement);

  const maxScoreElement = document.createElement('div');
  maxScoreElement.innerText = `Maxscore: ${maxScore}`
  maxScoreElement.style.position = 'absolute';
  maxScoreElement.style.top = '30px';
  maxScoreElement.style.left = '10px';
  maxScoreElement.style.color = 'white';
  maxScoreElement.style.fontFamily = 'Arial';
  document.body.appendChild(maxScoreElement);

  function updateScore() {
    score++;
    if (score > maxScore) {
        maxScore = score;
        localStorage.setItem('maxScore', maxScore);
    }

    scoreElement.textContent = `Puntaje: ${score}`;
    maxScoreElement.textContent = `Máximo puntaje: ${maxScore}`;
    console.log(`Puntaje actual: ${score}, Máximo puntaje: ${maxScore}`);
}


  //Audio 1
  const listener = new THREE.AudioListener();
  camera.add( listener );
  const sound = new THREE.Audio( listener );

  const audioLoader = new THREE.AudioLoader();
  audioLoader.load( 'public/audio/suspense_strings_001wav-14805.wav', function( buffer ) {
    sound.setBuffer( buffer );
    sound.setLoop( false );
    sound.setVolume( 1 );
  });


  //Audio 2
  const listener2 = new THREE.AudioListener();
  camera.add( listener2 );
  const sound2 = new THREE.Audio( listener2 );

  const audioLoader2 = new THREE.AudioLoader();
  audioLoader2.load( 'public/audio/happy-days-123082.wav', function( buffer ) {
    sound2.setBuffer( buffer );
    sound2.setLoop( false );
    sound2.setVolume( 1 );
  });

  let gameOver = false;
  
  function handleCollision() {
    // Detener el juego
    gameOver = true;
    //Feedback cuando pierdes
    const targetPosition = sphere.position.clone().add(new THREE.Vector3(0, 0, 5)); // Puedes ajustar la nueva posición según tus necesidades
    camera.position.lerp(targetPosition, 0.5);
    
    const loser = document.createElement('div');
    loser.innerText = `Perdiste`
    loser.style.position = 'absolute';
    loser.style.top = '500px';
    loser.style.left = '400px';
    loser.style.color = 'white';
    loser.style.fontFamily = 'Times New Roman';
    loser.style.fontSize = '65px'
    document.body.appendChild(loser);
    sound.play();
    score = 0;
    sound2.stop()

    const reloadButton = document.createElement('button');
    reloadButton.innerText = 'Recargar';
    reloadButton.style.position = 'absolute';
    reloadButton.style.top = '600px';
    reloadButton.style.left = '400px';
    reloadButton.style.backgroundColor = 'white'
    reloadButton.style.color = 'black'
    reloadButton.style.fontSize = '25px'
    reloadButton.addEventListener('click', function() {
      location.reload();
    });
    document.body.appendChild(reloadButton);

    if (!gameOver) {
      updateScore();
  }  
  }


  function animate() {
    requestAnimationFrame(animate);
    velocity -= 0.005; // Gravedad
    sphere.position.y += velocity;
    
    if (gameOver) return; 


    // Detección de colisiones
    obstacles.forEach(obstacle => {
        if (sphere.position.distanceTo(obstacle.position) < 1) {
            handleCollision();
        }
    });

    // Mover los obstáculos hacia la esfera
    obstacles.forEach(obstacle => {
        obstacle.position.x -= 0.05; //la velocidad de movimiento
    });

    // Eliminar obstáculos fuera de la vista
    obstacles.forEach((obstacle, index) => {
        if (obstacle.position.x < -10) {
            scene.remove(obstacle);
            obstacles.splice(index, 1);
        }
    });

    // Crear nuevos obstáculos cada 15 segundos
    if (Math.floor(Date.now() / 1000) % 30 === 0) {
        obstacles.forEach(obstacle => {
            scene.remove(obstacle);
        });
        obstacles.length = 0;
    }

    if (sphere.position.y < -1) {
        velocity = 0;
        sphere.position.y = -1;
    }

    if (!gameOver) {
      updateScore();
  }
    renderer.render(scene, camera);
}

  
  
  animate();
  
  document.addEventListener('keydown', function(event) {
      if (event.keyCode === 32) {
          jump();

          if (!gameOver)
            sound2.play();
          if (gameOver)
            sound2.stop();
      }
  });
  
}

const App = () => {

  return (
    <>
      {doThreeJS()}
    </>
  )
}

export default App
