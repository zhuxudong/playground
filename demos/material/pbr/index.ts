import { EncodingMode, SphericalHarmonics3Baker } from "@oasis-engine/baker";
import { OrbitControl } from "@oasis-engine/controls";
import * as dat from "dat.gui";
import {
  AssetType,
  BackgroundMode,
  Camera,
  Color,
  DiffuseMode,
  DirectLight,
  GLTFResource,
  PrimitiveMesh,
  SkyBoxMaterial,
  SpecularMode,
  SphericalHarmonics3,
  TextureCubeMap,
  Vector3,
  WebGLEngine
} from "oasis-engine";

//-- create engine object
let engine = new WebGLEngine("o3-demo");
engine.canvas.resizeByClientSize();

let scene = engine.sceneManager.activeScene;
const { ambientLight, background } = scene;
const rootEntity = scene.createRootEntity();

const color2glColor = (color) => new Color(color[0] / 255, color[1] / 255, color[2] / 255);
const glColor2Color = (color) => new Color(color[0] * 255, color[1] * 255, color[2] * 255);
const gui = new dat.GUI();
gui.domElement.style = "position:absolute;top:0px;left:50vw";

let envFolder = gui.addFolder("EnvironmentMapLight");
envFolder.add(ambientLight, "specularIntensity", 0, 1);
envFolder.add(ambientLight, "diffuseIntensity", 0, 1);

let directLightColor = { color: [255, 255, 255] };
let directLightNode = rootEntity.createChild("dir_light");
let directLight = directLightNode.addComponent(DirectLight);
directLight.color = new Color(1, 1, 1);
let dirFolder = gui.addFolder("DirectionalLight1");
dirFolder.add(directLight, "enabled");
dirFolder.addColor(directLightColor, "color").onChange((v) => (directLight.color = color2glColor(v)));
dirFolder.add(directLight, "intensity", 0, 1);

//Create camera
let cameraNode = rootEntity.createChild("camera_node");
cameraNode.transform.position = new Vector3(0, 0, 5);
cameraNode.addComponent(Camera);
cameraNode.addComponent(OrbitControl);

// Create sky
const sky = background.sky;
const skyMaterial = new SkyBoxMaterial(engine);
background.mode = BackgroundMode.Sky;
sky.material = skyMaterial;
sky.mesh = PrimitiveMesh.createCuboid(engine, 1, 1, 1);

Promise.all([
  engine.resourceManager
    .load<GLTFResource>("https://gw.alipayobjects.com/os/bmw-prod/150e44f6-7810-4c45-8029-3575d36aff30.gltf")
    .then((gltf) => {
      rootEntity.addChild(gltf.defaultSceneRoot);
      console.log(gltf);
    }),
  engine.resourceManager
    .load<TextureCubeMap>({
      url: "https://gw.alipayobjects.com/os/bmw-prod/20d58ffa-c7da-4c54-8980-4efaf91a0239.bin", // pisa_1K
      type: AssetType.HDR
    })
    .then((cubeMap) => {
      ambientLight.specularTexture = cubeMap;
      ambientLight.specularMode = SpecularMode.HDR;
      skyMaterial.textureCubeMap = cubeMap;

      const sh = new SphericalHarmonics3();
      SphericalHarmonics3Baker.fromTextureCubeMap(cubeMap, sh, EncodingMode.RGBE);
      ambientLight.diffuseMode = DiffuseMode.SphericalHarmonics;
      ambientLight.diffuseSphericalHarmonics = sh;
    })
]).then(() => {
  engine.run();
});
