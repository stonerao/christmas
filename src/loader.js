import {
    GLTFLoader
} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {
    DRACOLoader
} from 'three/examples/jsm/loaders/DRACOLoader.js'
import {
    BasisTextureLoader
} from 'three/examples/jsm/loaders/BasisTextureLoader.js'

const gltfLoader = new GLTFLoader()
const dracoLoader = new DRACOLoader();
const basisLoader = new BasisTextureLoader();

gltfLoader.setDRACOLoader(dracoLoader);

class Loader {
    constructor() {
        
    }

    setValues(config) {
        const keys = Object.keys(config);

        keys.forEach(key => {
            this[key] = config[key]
        });
    }

    // set file path
    setDecoderPath(url) {
        dracoLoader.setDecoderPath(url);
    }

    setTranscoderPath(url) {
        basisLoader.setTranscoderPath(url);
        basisLoader.detectSupport(this.renderer);
    }

    // load model
    loadModel(url) {
        return new Promise((resolve, reject) => {
            gltfLoader.load(url, (object) => {
                console.log(object)
                resolve(object.scene);
            })
        })
    }

    loadBasis(url) {
        return new Promise((resolve, reject) => {
            basisLoader.load(url, (texture) => {
                return resolve(texture);
            })
        }, (err) => {
            reject(err)
        })
    }
}

const LoaderComponent = new Loader();

export default LoaderComponent;