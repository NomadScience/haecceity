import { cpkColors, table, stowe, stoweColors } from './constants.js';

export default function PeriodicTable() {
  var _hasRunTable = false;
  var _scene; // kludge for mountToScene
  var _setTableStowe, _setTableCPK, _setTableHeatmap; // kludge for color changes

  var _transformStowe, _transformStoweFlat, _transformMendeleev; // ulgh, kludge for transforms

  var _ctx = this; // please free me from this mortal coil

  /*
    These represent a quicky refactor
  */
  var __setDataOpacities = () => {
    console.warn('WARNING: called __setDataOpacities before it was defined')
  }; // kludge for a horrible closure down below

  function mountToScene(element, cb) {
    if (!_scene) {
      console.warn('Tried to called mountToScene before a scene has been created. Ignoring.');
    }
    console.log('called mount to scene', element);
    var chartThing = new THREE.CSS3DObject(element);
    chartThing.scale.x = 1.4;
    chartThing.scale.y = 1.4;
    chartThing.scale.z = 1.4;
    chartThing.position.y += 750;
    chartThing.position.x -= 1300;
    if (typeof cb === 'function') {
      cb(chartThing);
    }
    _scene.add(chartThing);
  }

  function resetOpacities() {
    document.querySelectorAll('.element').forEach(el => {
      const elementName = el.innerText.split('\n')[1];
      el.style.opacity = 1;
    });
  }

  // Sigh, I'm definitely going to hell for this
  function setDataOpacities(data, skipTransition) {
    if (data && /Array/.test(data.constructor.name)) {
      let _data = {};
      data.forEach(n => _data[n] = true);
      data = _data;
    }
    console.log('??', data);
    return __setDataOpacities(data, skipTransition);
  }

  function genStoweColors(stoweStructure, colorsByShell) {
    colorsByShell = Object.assign({
      0: 'yellow',
      1: 'green',
      2: 'orange',
      3: 'cyan',
    }, colorsByShell);
    let stoweColors = {};
    stoweStructure.forEach((layer, layerIndex) => {
      layer.forEach((shell, shellIndex) => {
        shell.forEach((element, posIndex) => {
          stoweColors[element] = colorsByShell[shellIndex];
        });
      });
    });
    return stoweColors;
  }

  function showPeriodicTable(elementId) {
    if (!_ctx.elementId && !elementId) {
      console.error('First call to showPeriodicTable() must include elementId. Ignoring.');
      return;
    }
    _ctx.elementId = elementId.replace('#', '');
    _hasRunTable = true; // um, probably want to get rid of this


    //colorChannelA and colorChannelB are ints ranging from 0 to 255
    function colorChannelMixer(colorChannelA, colorChannelB, amountToMix){
        var channelA = colorChannelA*amountToMix;
        var channelB = colorChannelB*(1-amountToMix);
        return parseInt(channelA+channelB);
    }
    //rgbA and rgbB are arrays, amountToMix ranges from 0.0 to 1.0
    //example (red): rgbA = [255,0,0]
    function colorMixer(rgbA, rgbB, amountToMix){
        var r = colorChannelMixer(rgbA[0],rgbB[0],amountToMix);
        var g = colorChannelMixer(rgbA[1],rgbB[1],amountToMix);
        var b = colorChannelMixer(rgbA[2],rgbB[2],amountToMix);
        return "rgb("+r+","+g+","+b+")";
    }


    function genHeatmapColors(original) {
      let _count = 0;
      const heatmapColors = Object.assign({}, original)
      for (let key in heatmapColors) {
        _count++;
        heatmapColors[key] = colorMixer([0,255,0], [255,0,0], Math.random()*0.8);
      }
      return heatmapColors;
    }

    var heatmapColors = genHeatmapColors(cpkColors);

    function setColors(colors) {
      document.querySelectorAll('.element').forEach(el => {
        const elementName = el.innerText.split('\n')[1];
        const newColor = colors[elementName];
        el.style.backgroundColor = newColor;
      })
    };

    function setOpacities(opacity, skipTransition = false, selectableThreshold = 1) {
      document.querySelectorAll('.element').forEach(el => {
        const elementName = el.innerText.split('\n')[1];
        const newOpacity = opacity[elementName];
        if (skipTransition) {
          el.style.opacity = newOpacity;
        } else {
          const transition = el.style.transition;
          el.style.transition = 'none';
          el.style.opacity = newOpacity;
          el.style.transition = transition;
        }
        if (selectableThreshold && newOpacity >= selectableThreshold) {
          el.classList.add('selectable');
        } else {
          el.classList.remove('selectable');
        }
      })
    };



    /*
      Looks like this piece of crap is here due to closuring in cpkColors
    */
    __setDataOpacities = (data, skipTransition = false) => {
      const max = Math.max.apply(null, Object.values(data));
      const dataColors = Object.assign({}, cpkColors)
      for (let key in cpkColors) {
        let percent = (data[key] || 0) / max;
        if (percent) {
          percent = 1;
        } else {
          percent = 0.25;
        }
        // dataColors[key] = colorMixer([0,255,0], [255,0,0], percent);
        dataColors[key] = percent;
      }
      setOpacities(dataColors, skipTransition, 1);
    }

    var _activeElements = [];

    // Oh... Oh my GOD OH MY GOD NO!
    setTimeout(() => {
      document.querySelectorAll('.element').forEach(el => {
        el.addEventListener('mouseover', e => {
          console.log(el.classList.contains('selectable'));
          const element = el.innerText.split('\n')[2];
          const symbol = el.innerText.split('\n')[1];

          const lastActive = document.querySelector('.element.active')
          lastActive && lastActive.classList.remove('active');
          el.classList.add('active');
          document.dispatchEvent(new CustomEvent('el-mouseover', { detail: { el, element, symbol } }));
        });
        el.addEventListener('click', e => {
          if (!el.classList.contains('selectable')) {
            return;
          }
          // console.log(el.innerText);
          const element = el.innerText.split('\n')[2];
          const symbol = el.innerText.split('\n')[1];

          if (!_activeElements.includes(symbol)) {
            console.log('activated', symbol);
            _activeElements.push(symbol);
          } else {
            console.log('deactivated', symbol);
            _activeElements.pop(symbol);
          }

          _activeElements.push()
          const lastActive = document.querySelector('.element.active');
          lastActive && lastActive.classList.remove('active');
          el.classList.add('active');
          document.dispatchEvent(new CustomEvent('el-click', { detail: { el, element, symbol } }));
        });
      });
    }, 1000);

    var camera, scene, renderer;
    var controls;

    var objects = [];
    var targets = { table: [], stowe: [], stoweFlat: [], helix: [], grid: [] };

    console.warn('before init', fuck.clientHeight);
    init(_ctx.elementId);
    animate();

    function init(elementId) {
      camera = new THREE.PerspectiveCamera( 40, 1, 1, 10000 );
      camera.position.z = 3000;

      scene = new THREE.Scene();

      


      var chartContainer = document.createElement('div');
      var label = document.createElement('div');
      label.id = 'chart-label';


      chartContainer.className = 'chart three-chart-container';
      var canvas = document.createElement('canvas');
      canvas.id = 'chart1';

      chartContainer.appendChild(canvas);
      const posOffset = 280;

      _scene = scene; // this get closured into mountToScene; sorry, programming gods
      mountToScene(chartContainer);

      var objectMap = {};
      for ( var i = 0; i < table.length; i += 5 ) {

        var element = document.createElement( 'div' );
        element.className = 'element';

        element.style.backgroundColor = cpkColors[table[i]]; //'rgba(0,127,127,' + ( Math.random() * 0.5 + 0.25 ) + ')';

        var number = document.createElement( 'div' );
        number.className = 'number';
        number.textContent = ( i / 5 ) + 1;
        element.appendChild( number );

        var symbol = document.createElement( 'div' );
        symbol.className = 'symbol';
        symbol.textContent = table[ i ];
        element.appendChild( symbol );

        var details = document.createElement( 'div' );
        details.className = 'details';
        details.innerHTML = table[ i + 1 ] + '<br>' + table[ i + 2 ];
        element.appendChild( details );

        var object = new THREE.CSS3DObject( element );
        object.position.x = Math.random() * 3000 - 1500;
        object.position.y = Math.random() * 2000 - 1000;
        object.position.z = Math.random() * 3000 - 1500;

        object._index = i/5;
        objectMap[table[i]] = object;

        scene.add( object );

        objects.push( object );

        //

        var object = new THREE.Object3D();
        object.position.x = ( table[ i + 3 ] * 140 ) - 1330;
        object.position.y = - ( table[ i + 4 ] * 180 ) + 990 + posOffset; // recent offset is last term

        targets.table.push( object );

      }

      var tableGroup = new THREE.Group();
      tableGroup.position.y = -260;

      objects.forEach(object => tableGroup.add(object));
      scene.add(tableGroup);


      _setTableStowe = setColors.bind(null, genStoweColors(stowe));
      _setTableHeatmap = setColors.bind(null, heatmapColors);
      _setTableCPK = setColors.bind(null, cpkColors);

      initStoweTargets(stowe, targets.stowe);
      function initStoweTargets(stowePositions, stoweTargets) {
        let _accOffset = 0;
        let layerOffsets = [0, 0, 90, 200, 300, 300, 170];
        stowePositions.forEach((layer, layerIndex) => {
          _accOffset += layerOffsets[layerIndex] || 0;

          layer.forEach((shell, shellIndex) => {
            shell.forEach((element, posIndex) => {
              var elObject = objectMap[element];
              var object = new THREE.Object3D();
              object.position.y = -layerIndex*300 - _accOffset + posOffset*5;
              object.position.z = -layerIndex*150 - _accOffset;

              stoweTargets[elObject._index] = object;

              let yOffset, xOffset;

              // To Do: shorten this up; the pattern is pretty obvious
              switch(shellIndex) {
                case 0:
                  object.position.x = posIndex*140;
                  stoweTargets[elObject._index] = object;
                  return;
                case 1:
                  yOffset =
                    (posIndex <= 1) ? -1 :
                    (posIndex <= 3) ? 1 : 0;
                  xOffset =
                    (posIndex <= 3) ?
                      (!(posIndex%2) ? 0 : 1) :
                      ((posIndex%2) ? -1 : 2);

                  object.position.y -= yOffset*180;
                  object.position.x += xOffset*140;
                  return;
                case 2:
                  yOffset =
                    (posIndex <= 1) ? -2 :
                    (posIndex <= 3) ? 2 :
                    (posIndex <= 5) ? -1 :
                    (posIndex <= 7) ? 1 : 0;
                  xOffset =
                    (posIndex <= 3) ?
                      (!(posIndex%2) ? 0 : 1) :
                    (posIndex <= 7) ?
                      (!(posIndex%2) ? -1 : 2) :
                    !(posIndex%2) ? -2 : 3;

                  object.position.y -= yOffset*180;
                  object.position.x += xOffset*140;
                  return;
                case 3:
                  yOffset =
                    (posIndex <= 1) ? -3 :
                    (posIndex <= 3) ? 3 :
                    (posIndex <= 5) ? -2 :
                    (posIndex <= 7) ? 2 :
                    (posIndex <= 9) ? -1 :
                    (posIndex <= 11) ? 1 : 0;
                  xOffset =
                    (posIndex <= 3) ?
                      (!(posIndex%2) ? 0 : 1) :
                    (posIndex <= 7) ?
                      (!(posIndex%2) ? -1 : 2) :
                    (posIndex <= 11) ?
                      (!(posIndex%2) ? -2 : 3) :
                    !(posIndex%2) ? -3 : 4;
                  object.position.y -= yOffset*180;
                  object.position.x += xOffset*140;
                  return;
              }
            });
          });
        });
      }

      initStoweFlatTargets(stowe, targets.stoweFlat)
      function initStoweFlatTargets(stowePositions, stoweTargets) {
        let _accOffset = 0;
        let layerOffsets = [0, 0, 90, 200, 300, 300, 170];
        stowePositions.forEach((layer, layerIndex) => {
          _accOffset += layerOffsets[layerIndex] || 0;

          layer.forEach((shell, shellIndex) => {
            shell.forEach((element, posIndex) => {
              var elObject = objectMap[element];
              var object = new THREE.Object3D();

              stoweTargets[elObject._index] = object;

              let yOffset, xOffset;

              // These are the n-values normally mapped onto the z-axis
              // Move them in two dimensions according to Stowe-Janet-Scerri
              switch(layerIndex) {
                case 0:
                  // Top Left
                  object.position.x -= 1225;
                  object.position.y += 1550;
                  break;
                case 1:
                  // Upper Left
                  object.position.x -= 1025;
                  object.position.y += 1000;
                  break;
                case 2:
                  // Middle Left
                  object.position.y += 350;
                  object.position.x -= 650;
                  break;
                case 3:
                  // Bottom Center
                  object.position.y -= 300;
                  break;
                case 4:
                  // Top Center
                  object.position.y += 1000;
                  break;
                case 5:
                  // Middle Right
                  object.position.y += 350;
                  object.position.x += 650;
                  break;
                case 6:
                  // Lower Right
                  object.position.x += 1025;
                  object.position.y -= 300;
                  break
                default:
                  break;
              }


              // To Do: shorten this up; the pattern is pretty obvious
              switch(shellIndex) {
                case 0:
                  object.position.x += posIndex*140;
                  stoweTargets[elObject._index] = object;
                  return;
                case 1:
                  yOffset =
                    (posIndex <= 1) ? -1 :
                    (posIndex <= 3) ? 1 : 0;
                  xOffset =
                    (posIndex <= 3) ?
                      (!(posIndex%2) ? 0 : 1) :
                      ((posIndex%2) ? -1 : 2);

                  object.position.y -= yOffset*180;
                  object.position.x += xOffset*140;
                  return;
                case 2:
                  yOffset =
                    (posIndex <= 1) ? -2 :
                    (posIndex <= 3) ? 2 :
                    (posIndex <= 5) ? -1 :
                    (posIndex <= 7) ? 1 : 0;
                  xOffset =
                    (posIndex <= 3) ?
                      (!(posIndex%2) ? 0 : 1) :
                    (posIndex <= 7) ?
                      (!(posIndex%2) ? -1 : 2) :
                    !(posIndex%2) ? -2 : 3;

                  object.position.y -= yOffset*180;
                  object.position.x += xOffset*140;
                  return;
                case 3:
                  yOffset =
                    (posIndex <= 1) ? -3 :
                    (posIndex <= 3) ? 3 :
                    (posIndex <= 5) ? -2 :
                    (posIndex <= 7) ? 2 :
                    (posIndex <= 9) ? -1 :
                    (posIndex <= 11) ? 1 : 0;
                  xOffset =
                    (posIndex <= 3) ?
                      (!(posIndex%2) ? 0 : 1) :
                    (posIndex <= 7) ?
                      (!(posIndex%2) ? -1 : 2) :
                    (posIndex <= 11) ?
                      (!(posIndex%2) ? -2 : 3) :
                    !(posIndex%2) ? -3 : 4;
                  object.position.y -= yOffset*180;
                  object.position.x += xOffset*140;
                  return;
              }
            });
          });
        });
      }



      // helix

      var vector = new THREE.Vector3();

      for ( var i = 0, l = objects.length; i < l; i ++ ) {

        var theta = i * 0.175 + Math.PI;
        var y = - ( i * 8 ) + 450;

        var object = new THREE.Object3D();

        object.position.setFromCylindricalCoords( 900, theta, y );

        vector.x = object.position.x * 2;
        vector.y = object.position.y;
        vector.z = object.position.z * 2;

        object.lookAt( vector );

        targets.helix.push( object );

      }

      // grid

      for (var i = 0; i < objects.length; i++) {

        var object = new THREE.Object3D();

        object.position.x = (( i % 5 ) * 400) - 800;
        object.position.y = (-( Math.floor( i / 5 ) % 5) * 400) + 800;
        object.position.z = (Math.floor(i / 25)) * 1000 - 2000;

        targets.grid.push(object);
      }

      renderer = _ctx.renderer = new THREE.CSS3DRenderer();
      const container = _ctx.container = document.getElementById(_ctx.elementId);

      /*
        Add a container that fits the size of the parent, but which centers its contents
      */
      const relativeContainer = _ctx.relativeContainer = document.createElement('div');
      relativeContainer.classList.add('periodic-table-relative-container');
      Object.assign(relativeContainer.style, {
         position: 'relative',
         width: '100%',
         height: '100%',
         display: 'flex',
         justifyContent: 'center',
         alignItems: 'center',
      });
      container.appendChild(relativeContainer);

      const containerWidth = _ctx.containerWidth = relativeContainer.clientWidth;
      const containerHeight = _ctx.containerHeight = relativeContainer.clientHeight;

      _setSizes(containerWidth, containerHeight, relativeContainer, renderer);

      relativeContainer.appendChild(renderer.domElement);

      controls = new THREE.TrackballControls(camera, renderer.domElement);

      controls.rotateSpeed = 0.1;
      controls.minDistance = 500;
      controls.maxDistance = 6000;
      controls.addEventListener( 'change', (e) => {
        // Is this necessary?
        const { y } = camera.rotation;
        camera.rotation.z = 0.00;
        render();
      });

      var button = document.getElementById( 'table' );

      _transformMendeleev = function (transformCamera = false) {
          showCharts();

          const cb = () => {
            if (transformCamera) {
              new TWEEN.Tween( tableGroup.position )
                .to( { y: 0, z: 0 }, 700 )
                .easing( TWEEN.Easing.Quartic.InOut)
                .start();
              const coord = { x: tableGroup.rotation.x };
              new TWEEN.Tween( coord )
                .to( { x: 0 }, 700).onUpdate((s) => {
                  console.log(1-s, tableGroup.rotation.x);
                  tableGroup.rotation.x = -1 + s;
                })
                .easing( TWEEN.Easing.Quartic.InOut)
                .start();
            }
            new TWEEN.Tween(tableGroup.scale)
              .to({ x: 1, y: 1 }, 700)
              .easing( TWEEN.Easing.Quartic.InOut)
              .onUpdate(s => {
                // console.log(_camera.scale)
              })
              .start();
          };

          // tableGroup.rotation.x = 0;
          // tableGroup.position.y = 0;
          // tableGroup.position.z = 0;
          transform( targets.table, 2000, cb);

        }

      if (button) {
        button.addEventListener( 'click', transformMendeleev, false );
      }

      // Oh brother
      var button = document.getElementById( 'sphere' );

      _transformStowe = function () {
        hideCharts();

        const cb = () => {
          new TWEEN.Tween( tableGroup.position )
            .to( { y: 1400, z: -1500 }, 700 )
            .easing( TWEEN.Easing.Quartic.InOut)
            .start();
          const coord = { x: tableGroup.rotation };            new TWEEN.Tween( tableGroup.rotation )
            .to( { x: -Math.PI/4 }, 700).onUpdate((s) => {
              tableGroup.rotation.x = -s;
            })
            .easing( TWEEN.Easing.Quartic.InOut)
            .start();
        };

        transform( targets.stowe, 2000, cb );

      };


      _transformStoweFlat = function () {
        // hideCharts();
        const cb = () => {
          new TWEEN.Tween(tableGroup.scale)
            .to({ x: 0.9, y: 0.75 }, 700)
            .easing( TWEEN.Easing.Quartic.InOut)
            .start();
        };

        transform( targets.stoweFlat, 2000, cb );

      };

      if (button) {
        button.addEventListener( 'click', transformStowe, false );

        var button = document.getElementById( 'helix' );
        button.addEventListener( 'click', function () {
          transform( targets.helix, 2000 );

        }, false );
      }

      container.style.opacity = 1;
      transform( targets.table, 2000 );

      window.addEventListener( 'resize', onWindowResize, false );

    }

    function hideCharts() {
      document.querySelectorAll('.three-chart-container').forEach(el => {
        el.style.opacity = 0;
      })
    }
    function showCharts() {
      setTimeout(() => {
        document.querySelectorAll('.three-chart-container').forEach(el => {
          el.style.opacity = 1;
        });
      }, 900);
    }

    function transform( targets, duration, cb) {
      duration = 600;
      TWEEN.removeAll();
      if (typeof cb === 'function') cb();

      for ( var i = 0; i < objects.length; i ++ ) {
        if (!targets[i]) {
          continue;
        }

        var object = objects[ i ];
        var target = targets[ i ];

        new TWEEN.Tween( object.position )
          .to( { x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration )
          .easing( TWEEN.Easing.Quartic.InOut)
          .start();

        new TWEEN.Tween( object.rotation )
          .to( { x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration )
          .easing( TWEEN.Easing.Quartic.InOut)
          .start();

      }

      new TWEEN.Tween( this )
        .to( {}, duration * 2 )
        .onUpdate( render )
        .start();

    }

    let _container;

    function onWindowResize() {
      const {
        containerWidth: lastWidth,
        containerHeight: lastHeight,
      } = _ctx;
      const {
        clientWidth: curWidth,
        clientHeight: curHeight,
      } = _ctx.relativeContainer;
      if (lastWidth === curWidth && lastHeight === curHeight) {
        // console.error('No height change; doing nothing.');
        return;
      }
      _setSizes(curWidth, curHeight, _ctx.relativeContainer, _ctx.renderer);
    }

    function _setSizes(containerWidth, containerHeight, relativeContainer, renderer) {
      // console.error(`It changed, so I'm definitely doing something here`);
      let renderHeight, renderWidth;
      const containerAspect = containerWidth/containerHeight;
      if (containerAspect > 4/3) {
        // Container aspect is wider than 4:3, so size renderer by height
        renderHeight = containerHeight;
        renderWidth = containerHeight*4/3;
      } else {
        // Container apsect is narrower or equal to 4:3, so size renderer according to width
        renderWidth = containerWidth;
        renderHeight = containerWidth*3/4;
      }
      renderer.setSize(renderWidth, renderHeight);
      camera.aspect = 1;
      camera.updateProjectionMatrix();
      render();
    }


    function animate() {

      requestAnimationFrame( animate );
      TWEEN.update();
      controls.update();

    }

    function render() {
      renderer.render( scene, camera );
    }
  }

  function hidePeriodicTable() {
    if (!_ctx.elementId) {
      console.warn('Table has not been mounted. Ignoring.');
      return;
    }
    const el = document.getElementById(_ctx.elementId);
    el.style.opacity = 0;
    el.style.pointerEvents = 'none'
  }

  function togglePeriodicTable() {
    if (!_ctx.elementId) {
      console.warn('Table has not been mounted. Ignoring.');
      return;
    }
    const el = document.getElementById(_ctx.elementId);
    console.log(el.style.opacity);
    if (!parseInt(el.style.opacity)) {
      console.log('opacity is zero')
      if (_hasRunTable) {
        console.log('has run table is true so just showing the damn thing');
        el.style.opacity = 1;
        el.style.pointerEvents = 'auto';
        return true;
      } else {
         console.warn('togglePeriodicTable called without _hasRunTable equal to false');
      }
      showPeriodicTable();
      return true

    } else {
      console.log('um, el.style.opacity is not zero I guess')
      hidePeriodicTable();
      return false;
    }
  }
  function a(func) {
    if (!_hasRunTable) {
      return () => {
        console.error('Could not call delegated method. Initialize table first');
      }
    }
    return func;
  }

  return { 
    showPeriodicTable, 
    mountToScene, 
    setDataOpacities, 
    resetOpacities,
    // Uh... sure, whatever:
    setTableStowe: (...args) => a(_setTableStowe)(...args),
    setTableCPK: (...args) => a(_setTableCPK)(...args),
    setTableHeatmap: (...args) => a(_setTableHeatmap)(...args),
    transformMendeleev: (...args) => a(_transformMendeleev)(...args),
    transformStoweFlat: (...args) => a(_transformStoweFlat)(...args),
    transformStowe: (...args) => a(_transformStowe)(...args),
    mount(elementId) {
      if (!elementId){
        throw new Error('Missing parameter elementId')
      }
      if (_ctx._elementId) {
        throw new Error('Instance already mounted on id #' + _ctx._elementId);
      }
      _ctx._elementId = elementId;
      init(elementId);
      animate();
    },
    unmount() {
      document.getElementById(_ctx._elementId).remove();
      _ctx._elementId = undefined;
    },
  };
}
