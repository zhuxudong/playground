import { SphericalHarmonics3Baker } from "@oasis-engine/baker";
import { OrbitControl } from "@oasis-engine/controls";
import {
  AssetType,
  Camera,
  DiffuseMode,
  GLTFResource,
  PBRMaterial,
  SphericalHarmonics3,
  Texture2D,
  TextureCubeMap,
  WebGLEngine
} from "oasis-engine";

//-- create engine object
let engine = new WebGLEngine("o3-demo");
engine.canvas.resizeByClientSize();

let scene = engine.sceneManager.activeScene;
const rootEntity = scene.createRootEntity();

//-- create camera
let cameraNode = rootEntity.createChild("camera_node");
cameraNode.transform.position.setValue(0, 0, 5);
cameraNode.addComponent(Camera);
cameraNode.addComponent(OrbitControl);

Promise.all([
  engine.resourceManager
    .load<GLTFResource>("https://gw.alipayobjects.com/os/bmw-prod/150e44f6-7810-4c45-8029-3575d36aff30.gltf")
    .then((gltf) => {
      rootEntity.addChild(gltf.defaultSceneRoot);
      const material = gltf.materials[0];
      const video = document.getElementById("video") as HTMLVideoElement;
      const texture = new Texture2D(engine, 960, 540, undefined, false);

      function setImage() {
        texture.setImageSource(video);
        requestAnimationFrame(setImage);
      }
      setImage();

      (<PBRMaterial>material).baseTexture = texture;
    }),
  engine.resourceManager
    .load<TextureCubeMap>({
      urls: [
        "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*5w6_Rr6ML6IAAAAAAAAAAAAAARQnAQ",
        "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*TiT2TbN5cG4AAAAAAAAAAAAAARQnAQ",
        "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*8GF6Q4LZefUAAAAAAAAAAAAAARQnAQ",
        "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*D5pdRqUHC3IAAAAAAAAAAAAAARQnAQ",
        "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*_FooTIp6pNIAAAAAAAAAAAAAARQnAQ",
        "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*CYGZR7ogZfoAAAAAAAAAAAAAARQnAQ"
      ],
      type: AssetType.TextureCube
    })
    .then((cubeMap) => {
      scene.ambientLight.specularTexture = cubeMap;

      const sh = new SphericalHarmonics3();
      SphericalHarmonics3Baker.fromTextureCubeMap(cubeMap, sh);
      scene.ambientLight.diffuseMode = DiffuseMode.SphericalHarmonics;
      scene.ambientLight.diffuseSphericalHarmonics = sh;
    })
]).then(() => {
  engine.run();
});
