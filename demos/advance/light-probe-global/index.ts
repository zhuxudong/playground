import { SphericalHarmonics3Baker, EncodingMode } from "@oasis-engine/baker";
import { OrbitControl } from "@oasis-engine/controls";
import * as dat from "dat.gui";
import {
  AssetType,
  BackgroundMode,
  Camera,
  Color,
  DiffuseMode,
  SpecularMode,
  DirectLight,
  Logger,
  MeshRenderer,
  PBRMaterial,
  PrimitiveMesh,
  SkyBoxMaterial,
  SphericalHarmonics3,
  TextureCubeMap,
  Vector3,
  WebGLEngine
} from "oasis-engine";

Logger.enable();
// create engine object
let engine = new WebGLEngine("o3-demo");
engine.canvas.resizeByClientSize();

let scene = engine.sceneManager.activeScene;
const rootEntity = scene.createRootEntity();
const gui = new dat.GUI();

// env light debug
let envFolder = gui.addFolder("Env Light");
envFolder.add(scene.ambientLight, "specularIntensity", 0, 1);
envFolder.add(scene.ambientLight, "diffuseIntensity", 0, 1);
envFolder.open();

// Direct light
let directLightNode = rootEntity.createChild("dir_light");
let directLight = directLightNode.addComponent(DirectLight);
directLightNode.transform.rotate(-30, 0, 0);
directLight.color = new Color(1, 1, 1);
directLight.intensity = 0.2;

// Create camera
let cameraNode = rootEntity.createChild("camera_node");
cameraNode.transform.position = new Vector3(-3, 0, 3);
cameraNode.addComponent(Camera);
cameraNode.addComponent(OrbitControl);

// Create sky
const sky = scene.background.sky;
const skyMaterial = new SkyBoxMaterial(engine);
scene.background.mode = BackgroundMode.Sky;
sky.material = skyMaterial;
sky.mesh = PrimitiveMesh.createCuboid(engine, 1, 1, 1);

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
    url: "https://pissang.github.io/clay-viewer/editor/asset/texture/pisa.hdr",
    type: AssetType.HDR
  })
  .then((cubeMap) => {
    skyMaterial.textureCubeMap = cubeMap;
    scene.ambientLight.specularTexture = cubeMap;

    const sh = new SphericalHarmonics3();
    SphericalHarmonics3Baker.fromTextureCubeMap(cubeMap, sh, EncodingMode.RGBE);
    scene.ambientLight.diffuseSphericalHarmonics = sh;
    scene.ambientLight.diffuseMode = DiffuseMode.SphericalHarmonics;
    scene.ambientLight.specularMode = SpecularMode.HDR;
    gui
      .add({ bake: true }, "bake")
      .name("烘焙")
      .onChange((v) => {
        if (v) {
          scene.ambientLight.diffuseMode = DiffuseMode.SphericalHarmonics;
        } else {
          scene.ambientLight.diffuseMode = DiffuseMode.SolidColor;
        }
      });
  });

engine.run();
