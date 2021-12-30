import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import {
    OrbitControls
} from 'three/examples/jsm/controls/OrbitControls.js';

import {
    BasisTextureLoader
} from 'three/examples/jsm/loaders/BasisTextureLoader.js'

import loader from './/loader';
import composer from './composer';

const time = { value: 0 }

const flameMaterial = () => {
    const vertexShader = `
		varying vec3 vPosition;
		varying vec2 vUv;
		void main() { 
			vUv = uv; 
			vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
			gl_Position = projectionMatrix * mvPosition;
		}
		`;
    const fragmentShader = `
		uniform float iTime;
		uniform vec2 iResolution; 
		varying vec2 vUv;

        float snoise(vec3 uv, float res)
        {
            const vec3 s = vec3(1e0, 1e2, 1e3);
            
            uv *= res;
            
            vec3 uv0 = floor(mod(uv, res))*s;
            vec3 uv1 = floor(mod(uv+vec3(1.), res))*s;
            
            vec3 f = fract(uv); f = f*f*(3.0-2.0*f);

            vec4 v = vec4(uv0.x+uv0.y+uv0.z, uv1.x+uv0.y+uv0.z,
                        uv0.x+uv1.y+uv0.z, uv1.x+uv1.y+uv0.z);

            vec4 r = fract(sin(v*1e-1)*1e3);
            float r0 = mix(mix(r.x, r.y, f.x), mix(r.z, r.w, f.x), f.y);
            
            r = fract(sin((v + uv1.z - uv0.z)*1e-1)*1e3);
            float r1 = mix(mix(r.x, r.y, f.x), mix(r.z, r.w, f.x), f.y);
            
            return mix(r0, r1, f.z)*2.-1.;
        }

        void main(void) {
            
            vec2 p = (vUv - 0.5) * 1.5;
            p.x *= iResolution.x/iResolution.y;
            
            float color = 3.0 - (3.*length(2.*p));
            
            vec3 coord = vec3(atan(p.x,p.y)/6.2832+.5, length(p)*.4, .5);
            
            for(int i = 1; i <= 7; i++)
            {
                float power = pow(2.0, float(i));
                color += (1.5 / power) * snoise(coord + vec3(0.,-iTime*.05, iTime*.01), power*16.);
            }
            gl_FragColor = vec4( color, pow(max(color,0.),2.)*0.4, pow(max(color,0.),3.)*0.15 , color);

            // gl_FragColor = vec4(colour, 1.0);
        }
		`
    const material = new THREE.ShaderMaterial({
        uniforms: {
            iTime: time,
            iResolution: {
                value: new THREE.Vector2(window.innerWidth, window.innerHeight)
            }

        },
        side: 2,
        depthWrite: false,
        transparent: true,
        // blending: 2,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader
    })

    return material;
}


let instance;

const renderer = new THREE.WebGLRenderer({
    antialias: true
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding
renderer.setClearColor(0x020202, 1.0);

document.body.appendChild(renderer.domElement);

const stats = new Stats();
document.body.appendChild(stats.dom);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 200);
camera.position.set(-1.7955435538343625, 3.4950413571204386, 6.953178539017941);

const controls = new OrbitControls(camera, renderer.domElement);
controls.maxPolarAngle = Math.PI * 0.5;
controls.minDistance = 1;
controls.maxDistance = 400;
controls.target.set(0.009454812370159374, 0.77820012624936, -0.39288687465154853);

const light = new THREE.AmbientLight(0xffffff)
scene.add(light);

const bloomComposer = composer(renderer, scene, camera);



window.onresize = function () {

    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);

    bloomComposer.setSize(width, height);

    render();

};

const rMap = [
    { name: 'Fireplace', texture: 'bake_01.basis' },
    { name: 'Box 3', texture: 'bake_02.basis' },
    { name: 'Rack', texture: 'bake_02.basis' },
    { name: 'Floor', texture: 'bake_02.basis' },
    { name: 'Star', texture: 'bake_02.basis' },
    { name: 'Box 1', texture: 'bake_03.basis' },
    { name: 'Tree', texture: 'bake_04.basis' },
    { name: 'Balls yellow', texture: 'bake_05.basis' },
    { name: 'Balls red', texture: 'bake_05.basis' },
    { name: 'bake_05', texture: 'bake_05.basis' },
    { name: 'Bells', texture: 'bake_06.basis' },
    { name: 'Candles', texture: 'bake_05.basis' },
    { name: 'Bow red', texture: 'bake_06.basis' },
    { name: 'Sock red', texture: 'bake_07.basis' },
    { name: 'Sock green', texture: 'bake_07.basis' },
]

const basisMap = {

}

const playMusic = () => {
    const listener = new THREE.AudioListener();
    camera.add(listener);

    const audio = new THREE.Audio(listener);

    const loader = new THREE.AudioLoader();
    loader.load('./music.mp3', function (buffer) {
        audio.setBuffer(buffer);
        audio.play();
    });
}

loader.setValues({
    renderer
});

loader.setDecoderPath('./draco/gltf/');
loader.setTranscoderPath('./basis/');
 
// 
const count = 1000;
const dummy = new THREE.Object3D();


const range = [-50, 50]

const snowflakeRandomPosition = (time) => {
    const x = THREE.MathUtils.randFloat(range[0], range[1]);
    const y = THREE.MathUtils.randFloat(range[0], range[1]);
    const z = THREE.MathUtils.randFloat(range[0], range[1]);

    return { x, y, z }
}

function setupScene() {
    loader.loadModel('./christmas-props.-dracogltf.gltf').then((object) => {
        scene.add(object);

        const lightPoint = [];
        const rMapArray = rMap.map((e) => e.name);

        object.traverse((child) => {
            if (child.material) {
                const { material } = child;
                if (material.map) material.map.encoding = THREE.sRGBEncoding;
                const nameIndex = rMapArray.indexOf(material.name);
                child.material = new THREE.MeshBasicMaterial({
                    map: material.map,
                    transparent: material.transparent,
                    opacity: material.opacity,
                    color: 0xaaaaaa,
                    name: material.name
                });

                if (nameIndex !== -1) {
                    const tdata = rMap[nameIndex];

                    // 判断当前是否已经加载
                    if (basisMap[tdata.texture]) {
                        child.material.map = basisMap[tdata.texture]
                    } else {
                        loader.loadBasis(`./textures/${tdata.texture}`).then((texture) => {
                            basisMap[tdata.texture] = texture;
                            texture.encoding = THREE.sRGBEncoding;
                            child.material.map = basisMap[tdata.texture];
                            child.material.needsUpdate = true;
                        })
                    }
                }

                if (child.material.name === 'Tree') {
                    child.material.transparent = true;
                    child.material.alphaTest = 0.3;
                }
                if (child.material.name === 'Flame') {
                    child.material.transparent = true;
                    child.material.alphaTest = 0.01;
                }
                if (child.material.name === 'Fire') {
                    child.material = flameMaterial();
                }

                //  
                if (child.name.includes('Garland_Garland')) {
                    child.material.color.setStyle('#ffffff');
                    child.scale.multiplyScalar(1.5);
                    lightPoint.push(child);
                }  
            }
        })

        const color = [
            '#FF2306',
            '#E2FF05',
            '#ffffff',
            '#FFAA08',
            '#ff5555',
        ]

        setInterval(() => {
            lightPoint.forEach((elem) => {
                elem.material.color.setStyle(color[Math.floor(Math.random() * color.length)])
            })
        }, 1000)

        setTimeout(() => {
            playMusic();
        }, 6000)
    })

    // 加载雪花
    loader.loadModel('./real-snowflake.quads.gltf').then((object) => {
        // 随机位置出现雪花.children

        const mesh = object.children[0];

        mesh.geometry.scale(0.02, 0.02, 0.02);
        mesh.geometry.rotateX(Math.PI / 2);
        mesh.material.setValues({
            metalness: 0.2
        });

        instance = new THREE.InstancedMesh(mesh.geometry, mesh.material, count);

        const infos = [];
        for (let i = 0; i < count; i++) {
            infos.push({
                position: snowflakeRandomPosition(),
                scale: THREE.MathUtils.randFloat(1.0, 1.5),
                rotation: { x: 0, y: 0, z: Math.random() * Math.PI }
            })
        }

        instance.userData.data = infos;

        scene.add(instance);
    })

}

function render(dt = 0.15) {
    bloomComposer.render();
    if (instance) {
        const { data } = instance.userData;
        for (let i = 0; i < count; i++) {
            const { position, scale, rotation } = data[i];
            const s = THREE.MathUtils.clamp(Math.cos(position.y) + scale, 1.0, 2.5);
            dummy.scale.set(s, s, s);
            dummy.position.copy(position)

            dummy.lookAt(camera.position);
            dummy.rotation.z = rotation.z + position.y;
            dummy.updateMatrix();

            instance.setMatrixAt(i++, dummy.matrix);

            position.y -= dt;
            position.x -= dt * 0.2;

            if (position.y <= range[0]) {
                position.y = range[1];
            }
            if (position.x <= range[0]) {
                position.x = range[1];
            }
        }

        instance.instanceMatrix.needsUpdate = true;
    };
}
const clock = new THREE.Clock()

const tick = () => {
    const dt = clock.getDelta();

    controls.update()

    render(dt);

    time.value += dt;
    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

setupScene();
tick();