import { EncodingMode, SphericalHarmonics3Baker } from "@oasis-engine/baker";
import { OrbitControl } from "@oasis-engine/controls";
import {
  AssetType,
  BackgroundMode,
  Camera,
  DiffuseMode,
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

engine.resourceManager
  .load<TextureCubeMap>({
    url: "https://gw.alipayobjects.com/os/bmw-prod/10c5d68d-8580-4bd9-8795-6f1035782b94.bin", // sunset_1K
    // url: "https://gw.alipayobjects.com/os/bmw-prod/20d58ffa-c7da-4c54-8980-4efaf91a0239.bin",// pisa_1K
    // url: "https://gw.alipayobjects.com/os/bmw-prod/59b28d9f-7589-4d47-86b0-52c50b973b10.bin" // footPrint_2K
    type: AssetType.HDR
  })
  .then((cubeMap) => {
    // ambientLight.specularTexture = cubeMap;
    ambientLight.specularMode = SpecularMode.HDR;
    skyMaterial.textureCubeMap = cubeMap;

    // const sh = new SphericalHarmonics3();
    // SphericalHarmonics3Baker.fromTextureCubeMap(cubeMap, sh, EncodingMode.RGBE);
    // ambientLight.diffuseMode = DiffuseMode.SphericalHarmonics;
    // ambientLight.diffuseSphericalHarmonics = sh;
  });

engine.run();
