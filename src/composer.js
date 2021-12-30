import * as THREE from 'three';
import {
    EffectComposer
} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {
    RenderPass
} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {
    ShaderPass
} from 'three/examples/jsm/postprocessing/ShaderPass.js';
import {
    UnrealBloomPass
} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {
    FXAAShader
} from 'three/examples/jsm/shaders/FXAAShader.js'
 
const params = {
    bloomStrength: 0.4,
    bloomThreshold: 0,
    bloomRadius: 0
};

// -- 
export default (renderer, scene, camera) => {
    const renderScene = new RenderPass(scene, camera);

    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = params.bloomThreshold;
    bloomPass.strength = params.bloomStrength;
    bloomPass.radius = params.bloomRadius; 
    
    const effectFXAA = new ShaderPass(FXAAShader)
    effectFXAA.uniforms.resolution.value.set(1 / window.innerWidth, 1 / window.innerHeight)
    
    const bloomComposer = new EffectComposer(renderer);
    bloomComposer.renderToScreen = true;
    bloomComposer.addPass(renderScene);
    bloomComposer.addPass(bloomPass);

    return bloomComposer;
};