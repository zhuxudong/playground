import { SphericalHarmonics3Baker } from "@oasis-engine/baker";
import { OrbitControl } from "@oasis-engine/controls";
import * as dat from "dat.gui";
import {
  AssetType,
  Camera,
  Color,
  DirectLight,
  EnvironmentMapLight,
  Logger,
  MeshRenderer,
  PBRMaterial,
  PrimitiveMesh,
  SkyBox,
  SphericalHarmonics3,
  SystemInfo,
  TextureCubeMap,
  Vector3,
  WebGLEngine
} from "oasis-engine";

Logger.enable();
// create engine object
let engine = new WebGLEngine("o3-demo");
engine.canvas.width = window.innerWidth * SystemInfo.devicePixelRatio;
engine.canvas.height = window.innerHeight * SystemInfo.devicePixelRatio;

let scene = engine.sceneManager.activeScene;
const rootEntity = scene.createRootEntity();
const gui = new dat.GUI();
// env light
let envLightNode = rootEntity.createChild("env_light");
let envLight = envLightNode.addComponent(EnvironmentMapLight);
let envFolder = gui.addFolder("Env Light");
envFolder.add(envLight, "enabled");
envFolder.add(envLight, "specularIntensity", 0, 1);
envFolder.add(envLight, "diffuseIntensity", 0, 1);
envFolder.open();

// direct light
let directLightNode = rootEntity.createChild("dir_light");
let directLight = directLightNode.addComponent(DirectLight);
directLightNode.transform.rotate(-30, 0, 0);
directLight.color = new Color(1, 1, 1);
directLight.intensity = 0.2;

// create camera
let cameraNode = rootEntity.createChild("camera_node");
cameraNode.transform.position = new Vector3(-3, 0, 3);
cameraNode.addComponent(Camera);
cameraNode.addComponent(OrbitControl);

// material ball
const ball = rootEntity.createChild("ball");
const ballRender = ball.addComponent(MeshRenderer);
const material = new PBRMaterial(engine);
material.metallicFactor = 0;
material.roughnessFactor = 0;
ballRender.mesh = PrimitiveMesh.createSphere(engine, 1, 64);
ballRender.setMaterial(material);

engine.resourceManager
  .load<TextureCubeMap>({
    urls: [
      "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*TUkMQpLvsGYAAAAAAAAAAAAAARQnAQ",
      "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*1PF-Q5j3HKYAAAAAAAAAAAAAARQnAQ",
      "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*cY8-QLCjqrIAAAAAAAAAAAAAARQnAQ",
      "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*LTrfR619LjIAAAAAAAAAAAAAARQnAQ",
      "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*qrYcQYE-SOoAAAAAAAAAAAAAARQnAQ",
      "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*o_QqQI9ii9wAAAAAAAAAAAAAARQnAQ"
    ],
    type: AssetType.TextureCube
  })
  .then((cubeMap) => {
    envLight.specularTexture = cubeMap;

    const sh = new SphericalHarmonics3();
    SphericalHarmonics3Baker.fromTextureCubeMap(cubeMap, sh);
    rootEntity.addComponent(SkyBox).skyBoxMap = cubeMap;
    envLight.diffuseSphericalHarmonics = sh;
    gui
      .add({ bake: true }, "bake")
      .name("烘焙")
      .onChange((v) => {
        if (v) {
          envLight.diffuseSphericalHarmonics = sh;
        } else {
          envLight.diffuseSphericalHarmonics = null;
        }
      });
  });

engine.run();
