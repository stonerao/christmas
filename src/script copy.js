import './style.css'
import * as THREE from 'three'
import {
    OrbitControls
} from 'three/examples/jsm/controls/OrbitControls.js'
import {
    GLTFLoader
} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {
    FBXLoader
} from 'three/examples/jsm/loaders/FBXLoader.js'
import * as dat from 'dat.gui'
import {
    EffectComposer
} from 'three/examples/jsm/postprocessing/EffectComposer.js'
import {
    RenderPass
} from 'three/examples/jsm/postprocessing/RenderPass.js'
import {
    DotScreenPass
} from 'three/examples/jsm/postprocessing/DotScreenPass.js'
import {
    ShaderPass
} from 'three/examples/jsm/postprocessing/ShaderPass.js'
import {
    UnrealBloomPass
} from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import {
    SMAAPass
} from 'three/examples/jsm/postprocessing/SMAAPass.js'
import {
    FXAAShader
} from 'three/examples/jsm/shaders/FXAAShader.js'
/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

/**
 * Loaders
 */
const gltfLoader = new GLTFLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()
const textureLoader = new THREE.TextureLoader()
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000);
camera.position.set(-5, 5, 5);
camera.layers.enable(1);
var renderer = new THREE.WebGLRenderer({
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x101000);
document.body.appendChild(renderer.domElement);

var controls = new OrbitControls(camera, renderer.domElement);

var light = new THREE.DirectionalLight(0xffffff, 0.75);
light.position.setScalar(100);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.25));

var obj = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 4), new THREE.MeshLambertMaterial({
    color: new THREE.Color('#ff00aa'),
    wireframe: false
}));
obj.position.z = 0.25;
scene.add(obj);

var objBack = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 1), new THREE.MeshBasicMaterial({
    color: new THREE.Color('#115566'),
    wireframe: false
}));
objBack.position.z = -2.25;
objBack.layers.enable(1);
scene.add(objBack);




/** COMPOSER */
const renderScene = new RenderPass(scene, camera)

const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85)
bloomPass.threshold = 0.21
bloomPass.strength = 1.2
bloomPass.radius = 0.55
bloomPass.renderToScreen = true

const effectFXAA = new ShaderPass(FXAAShader)
effectFXAA.uniforms.resolution.value.set(1 / window.innerWidth, 1 / window.innerHeight)

const composer = new EffectComposer(renderer)
composer.setSize(window.innerWidth, window.innerHeight)

composer.addPass(renderScene)
composer.addPass(bloomPass)
composer.addPass(effectFXAA)


renderer.toneMappingExposure = Math.pow(0.9, 4.0)

render();

function render() {
    requestAnimationFrame(render);

    renderer.autoClear = false;
    renderer.clear();

    camera.layers.set(1);
    composer.render();

    renderer.clearDepth();
    camera.layers.set(0);
    renderer.render(scene, camera);
}