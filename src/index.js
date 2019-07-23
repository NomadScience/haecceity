import 'three';
import 'three/CanvasRenderer';
import 'three/Projector';
import 'three/CSS3DRenderer';
import 'three/TrackballControls'; // avoid unless absolutely needed
import TWEEN from '@tweenjs/tween.js';

console.log(THREE);

import DftCube from './DftCube';

export default {
  DftCube,
  THREE,
  TWEEN,
};
