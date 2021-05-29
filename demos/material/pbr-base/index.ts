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
  Logger,
  PrimitiveMesh,
  SkyBoxMaterial,
  SphericalHarmonics3,
  TextureCubeMap,
  Vector3,
  WebGLEngine
} from "oasis-engine";
Logger.enable();
//-- create engine object
const engine = new WebGLEngine("o3-demo", { alpha: true });
engine.canvas.resizeByClientSize();

const scene = engine.sceneManager.activeScene;
const { ambientLight, background } = scene;
ambientLight.specularIntensity = 1;
ambientLight.diffuseIntensity = 1;
const rootEntity = scene.createRootEntity();
const color2glColor = (color) => new Color(color[0] / 255, color[1] / 255, color[2] / 255);
const gui = new dat.GUI();

const envFolder = gui.addFolder("EnvironmentMapLight");
envFolder.add(ambientLight, "specularIntensity", 0, 1, 0.1);
envFolder.add(ambientLight, "diffuseIntensity", 0, 1, 0.1);
const directLightColor = { color: [255, 255, 255] };
const directLightNode = rootEntity.createChild("dir_light");
const directLight = directLightNode.addComponent(DirectLight);
directLightNode.transform.setRotation(0, 30, 0);

const dirFolder = gui.addFolder("DirectionalLight1");
dirFolder.add(directLight, "enabled");
dirFolder.addColor(directLightColor, "color").onChange((v) => (directLight.color = color2glColor(v)));
dirFolder.add(directLight, "intensity", 0, 3, 0.1);

//Create camera
const cameraNode = rootEntity.createChild("camera_node");
cameraNode.transform.position = new Vector3(0.25, 0.5, 1.5);
cameraNode.addComponent(Camera);
const control = cameraNode.addComponent(OrbitControl);
control.target.setValue(0.25, 0.25, 0);

// Create sky
const sky = background.sky;
const skyMaterial = new SkyBoxMaterial(engine);
background.mode = BackgroundMode.Sky;
sky.material = skyMaterial;
sky.mesh = PrimitiveMesh.createCuboid(engine, 1, 1, 1);

Promise.all([
  engine.resourceManager
    .load<GLTFResource>("https://gw.alipayobjects.com/os/bmw-prod/dda73ec2-6921-42c7-b109-b5cd386f4410.glb")
    .then((gltf) => {
      rootEntity.addChild(gltf.defaultSceneRoot);
      gltf.defaultSceneRoot.transform.setScale(100, 100, 100);
    }),
  // engine.resourceManager
  //   .load<TextureCubeMap>({
  //     urls: [
  //       "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*5bs-Sb80qcUAAAAAAAAAAAAAARQnAQ",
  //       "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*rLUCT4VPBeEAAAAAAAAAAAAAARQnAQ",
  //       "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*LjSHTI5iSPoAAAAAAAAAAAAAARQnAQ",
  //       "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*pgCvTJ85RUYAAAAAAAAAAAAAARQnAQ",
  //       "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*0BKxR6jgRDAAAAAAAAAAAAAAARQnAQ",
  //       "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*Pir4RoxLm3EAAAAAAAAAAAAAARQnAQ"
  //     ],
  //     type: AssetType.TextureCube
  //   })
  engine.resourceManager
    .load<TextureCubeMap>({
      type: AssetType.HDR,
      // url: "https://gw.alipayobjects.com/os/bmw-prod/10c5d68d-8580-4bd9-8795-6f1035782b94.bin"  // sunset_1K
      // url: "https://gw.alipayobjects.com/os/bmw-prod/20d58ffa-c7da-4c54-8980-4efaf91a0239.bin",// pisa_1K
      url: "https://gw.alipayobjects.com/os/bmw-prod/59b28d9f-7589-4d47-86b0-52c50b973b10.bin" // footPrint_2K
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

scene.background.solidColor = new Color(0, 0, 0, 0);
