import { IBLBaker, SphericalHarmonics3Baker } from "@oasis-engine/baker";
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
  SphericalHarmonics3,
  TextureCubeMap,
  Vector3,
  WebGLEngine
} from "oasis-engine";

const gui = new dat.GUI();

//-- create engine object
let engine = new WebGLEngine("canvas");
engine.canvas.resizeByClientSize();

const scene = engine.sceneManager.activeScene;
const { ambientLight, background } = scene;
const rootEntity = scene.createRootEntity();

const color2glColor = (color) => new Color(color[0] / 255, color[1] / 255, color[2] / 255);
gui.domElement.style = "position:absolute;top:0px;left:50vw";

const envFolder = gui.addFolder("EnvironmentMapLight");
envFolder.add(ambientLight, "specularIntensity", 0, 1);
envFolder.add(ambientLight, "diffuseIntensity", 0, 1);

const lightState = { color: [255, 255, 255], enabled: true, intensity: 1 };
let directLightNode = rootEntity.createChild("dir_light");
let directLightNode2 = rootEntity.createChild("dir_light2");
directLightNode.transform.setRotation(30, 0, 0);
directLightNode2.transform.setRotation(-30, 180, 0);
let directLight = directLightNode.addComponent(DirectLight);
let directLight2 = directLightNode2.addComponent(DirectLight);
let dirFolder = gui.addFolder("DirectionalLight");
dirFolder.add(lightState, "enabled").onChange((v) => {
  directLight.enabled = directLight2.enabled = v;
});
dirFolder.addColor(lightState, "color").onChange((v) => (directLight.color = directLight2.color = color2glColor(v)));
dirFolder.add(lightState, "intensity", 0, 1).onChange((v) => {
  directLight.intensity = directLight2.intensity = v;
});

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
    .load<GLTFResource>("https://gw.alipayobjects.com/os/bmw-prod/83219f61-7d20-4704-890a-60eb92aa6159.gltf")
    .then((gltf) => {
      rootEntity.addChild(gltf.defaultSceneRoot);
      console.log(gltf);
    }),
  engine.resourceManager
    .load<TextureCubeMap>({
      // url: "https://gw.alipayobjects.com/os/bmw-prod/10c5d68d-8580-4bd9-8795-6f1035782b94.bin", // sunset_1K
      // url: "https://gw.alipayobjects.com/os/bmw-prod/20d58ffa-c7da-4c54-8980-4efaf91a0239.bin",// pisa_1K
      url: "https://gw.alipayobjects.com/os/bmw-prod/59b28d9f-7589-4d47-86b0-52c50b973b10.bin", // footPrint_2K
      type: AssetType.HDR
    })
    .then((cubeMap) => {
      cubeMap = IBLBaker.fromTextureCubeMap(cubeMap) as any;
      ambientLight.specularTexture = cubeMap;
      skyMaterial.textureCubeMap = cubeMap;

      const sh = new SphericalHarmonics3();
      SphericalHarmonics3Baker.fromTextureCubeMap(cubeMap, sh);
      ambientLight.diffuseMode = DiffuseMode.SphericalHarmonics;
      ambientLight.diffuseSphericalHarmonics = sh;
    })
]).then(() => {
  engine.run();
});
