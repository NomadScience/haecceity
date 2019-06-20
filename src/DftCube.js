/*
  To Do:
    - Get the blue-overlay to properly cover the main element [DONE]
    - Make sure that the png file is coming from the library! [DONE]
    - Make sure the element is sized to the container, not to innerHeight and innerWidth [DONE]
    - Make sure that the stupid overlay stays square
    - Turn into a class with the following methods:
        mount(elementName)
        unmount()
    - Allow injection of a RenderManager in the constructor
    - Change element-finding method from getElementById to querySelector
*/
const LabelImage = require('../assets/DftCubeLabel.png');

export default function DftCube(opts) {
  var container, relativeContainer, overlay;
  var camera, scene, renderer, particle;
  var mouseX = 0, mouseY = 0;

  var containerWidth, containerHeight, smallerDimension;

  const SETTINGS = Object.assign({
    count: 100,
    speed: 1,
    cubeBaseColor: 'blue',
    cubeGlowColor: '#1e68b2',
  }, opts);

  var _sprites = [];
  // init();
  // animate();

  var _ctx = this;

  function init(elementId) {
    elementId = elementId.replace('#', ''); // remove hash if the user provided it
    _ctx.elementId = elementId;
    container = document.getElementById(elementId);

    if (!container) {
      console.error(`Failed to mount element on id ${container}. Not found.`)
      return;
    }
    containerWidth = container.clientWidth;
    containerHeight = container.clientHeight;

    // container.style.zIndex = -1;

    camera = new THREE.PerspectiveCamera(25, containerHeight / containerHeight, 1, 5000);
    camera.position.z = 1900;
    camera.position.y = 500;
    camera.position.x = -500;

    scene = new THREE.Scene();
    // scene.background = new THREE.Color( 0x000000 );
    scene.background = 'transparent';

    var cubeGeo = new THREE.BoxGeometry(400,400,400);
    var wireframeCubeGeo = new THREE.EdgesGeometry(cubeGeo);

    var wireframeCubeMat = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 2 } );
    var wireframeCubeMesh = new THREE.LineSegments(wireframeCubeGeo, wireframeCubeMat);

    var blueCubeMat = new THREE.MeshStandardMaterial( {
      emissive: new THREE.Color(SETTINGS.cubeBaseColor),
      opacity: 0.2,
      premultipliedAlpha: false,
      transparent: true
    } );
    var blueCubeMesh = new THREE.Mesh(cubeGeo, blueCubeMat);
    blueCubeMesh.renderOrder = 1; // Prevent ugly tri-edge discrepancies

    scene.add(blueCubeMesh);
    scene.add(wireframeCubeMesh);

    var material = new THREE.SpriteMaterial( {
      map: new THREE.CanvasTexture( generateSprite() ),
      blending: THREE.AdditiveBlending
    } );

    // Initialize the particles; could be refactored a bit better
    for (var i = 0; i < SETTINGS.count; i++ ) {
      particle = new THREE.Sprite(material);

      initParticle(particle);
      particle._vector = new THREE.Vector3(
        (Math.random()*2-1)*Math.random(),
        (Math.random()*2-1)*Math.random(),
        (Math.random()*2-1)*Math.random(),
      );

      _sprites.push(particle);
      scene.add( particle );
    }

    var legendMat = new THREE.SpriteMaterial({
      map: new THREE.TextureLoader().load(LabelImage),
      blending: THREE.NoBlending,
    });

    var legend = new THREE.Sprite( legendMat );
    legend.position.x = -350;
    legend.position.y = 5;
    legend.position.z = -100;
    legend.scale.y = 297;
    legend.scale.x = 100;

    scene.add( legend );

    // Using CanvasRenderer *purely* to avoid some artifacting that happens
    // with the WebGLRenderer. It should definitely be deprecated.
    // This requires use of a version of THREE.js prior to 0.97.0
    renderer = new THREE.CanvasRenderer({ alpha: true });

    renderer.setPixelRatio(window.devicePixelRatio);

    relativeContainer = document.createElement('div');
    relativeContainer.classList.add('dft-relative-container');
    Object.assign(relativeContainer.style, {
       position: 'relative',
       width: '100%',
       height: '100%',
       display: 'flex',
       justifyContent: 'center',
       alignItems: 'center',
    });

    container.appendChild(relativeContainer);

    relativeContainer.appendChild( renderer.domElement );

    overlay = document.createElement('div');
    overlay.classList.add('dft-overlay');

    Object.assign(overlay.style, {
      background: `radial-gradient(ellipse at center, ${SETTINGS.cubeGlowColor} 0%,#000000 55%)`,
      mixBlendMode: 'screen',
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      top: 0,
    });

    _setSizes(containerWidth, containerHeight, relativeContainer);
    relativeContainer.appendChild(overlay);

    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    window.addEventListener( 'resize', onWindowResize, false );
  }

  function onWindowResize() {
    containerWidth = container.clientWidth;
    containerHeight = container.clientHeight;

    _setSizes(containerWidth, containerHeight, relativeContainer);
  }

  function _setSizes(width, height, relativeContainer) {
    const smaller = width < height ? width : height;

    Object.assign(relativeContainer.style, {
      width: smaller + 'px',
      height: smaller + 'px',
    });

    renderer.setSize(smaller, smaller); 
    camera.aspect = 1;
    camera.updateProjectionMatrix();
  }

  function generateSprite() {
    // Note: this presumes canvas mode
    var canvas = document.createElement( 'canvas' );
    canvas.width = 32;
    canvas.height = 32;

    var context = canvas.getContext( '2d' );
    var gradient = context.createRadialGradient( canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2 );
    gradient.addColorStop( 0, 'rgba(255,200,0,0.5)' );
    gradient.addColorStop( 0.1, 'rgba(200,255,0,0.4)' );
    gradient.addColorStop( 0.2, 'rgba(0,255,150,0.2)' );
    gradient.addColorStop( 0.4, 'rgba(0,65,65,0.1)' );
    gradient.addColorStop( 1, 'rgba(0,0,0,0)' );

    context.fillStyle = gradient;
    context.fillRect( 0, 0, canvas.width, canvas.height );
    return canvas;

  }

  function initParticle(particle) {
    // var particle = this instanceof THREE.Sprite ? this : particle;
    particle.position.set( Math.random()*390-195, Math.random()*390-195, Math.random()*390-195);
    particle.scale.x = particle.scale.y = Math.random() * 64 + 128;
  }

  function onDocumentMouseMove(event) {
    mouseX = event.clientX - window.innerWidth/2;
    mouseY = event.clientY - window.innerHeight/2;
  }

  function moveSprites() {
    const { speed } = SETTINGS;
    _sprites.forEach(sprite => {
      const { x, y, z } = sprite.position;
      if (Math.abs(x) >= 195) {
        sprite._vector.x = -sprite._vector.x;
      }
      if (Math.abs(y) >= 195) {
        sprite._vector.y = -sprite._vector.y;
      }
      if (Math.abs(z) >= 195) {
        sprite._vector.z =  -sprite._vector.z;
      }

      // Make sure to clamp to the edges of the cube, even if speed is high
      // A bit inelegent, but gets it done
      sprite.position.x += sprite._vector.x*speed;
      if (Math.abs(sprite.position.x) >= 195) {
        sprite.position.x = Math.sign(sprite.position.x)*195;
      }
      sprite.position.y += sprite._vector.y*speed;
      if (Math.abs(sprite.position.y) >= 195) {
        sprite.position.y = Math.sign(sprite.position.y)*195;
      }
      sprite.position.z += sprite._vector.z*speed;
      if (Math.abs(sprite.position.z) >= 195) {
        sprite.position.z = Math.sign(sprite.position.z)*195;
      }
    });
  }

  function animate() {
    requestAnimationFrame( animate );
    render();
  }

  function render() {
    moveSprites();

    camera.position.x += (( mouseX - camera.position.x ) - 500) * 0.005;
    camera.position.y += (( - mouseY - camera.position.y ) + 500) * 0.005;
    camera.lookAt( scene.position );

    renderer.render( scene, camera );
  }

  return {
    mount(elementId) {
      if (!elementId){
        throw new Error('Missing parameter elementId')
      }
      if (this._elementId) {
        throw new Error('Instance already mounted on id #' + this._elementId);
      }
      _ctx._elementId = elementId;
      init(elementId);
      animate();
    },
    unmount() {
      document.getElementById(_ctx._elementId).remove();
      _ctx._elementId = undefined;
    },
  }
}