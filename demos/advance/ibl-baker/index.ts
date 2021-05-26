import { EncodingMode, SphericalHarmonics3Baker, IBLBaker, IBLBakerConfig } from "@oasis-engine/baker";
import { OrbitControl } from "@oasis-engine/controls";
import * as dat from "dat.gui";
import {
  AssetType,
  BackgroundMode,
  Camera,
  DiffuseMode,
  Layer,
  Logger,
  Material,
  MeshRenderer,
  PBRMaterial,
  PrimitiveMesh,
  RenderBufferDepthFormat,
  RenderColorTexture,
  RenderTarget,
  Shader,
  SkyBoxMaterial,
  SpecularMode,
  SphericalHarmonics3,
  TextureCubeFace,
  TextureCubeMap,
  TextureFilterMode,
  UnlitMaterial,
  Vector2,
  Vector3,
  WebGLEngine,
  WebGLMode
} from "oasis-engine";
Logger.enable();

const gui = new dat.GUI();
//-- create engine object
let engine = new WebGLEngine("o3-demo", { alpha: false, webGLMode: WebGLMode.WebGL2 });
engine.canvas.resizeByClientSize();

let scene = engine.sceneManager.activeScene;
const { ambientLight, background } = scene;
const rootEntity = scene.createRootEntity();

//Create camera
let cameraNode = rootEntity.createChild("camera_node");
cameraNode.transform.position = new Vector3(0, 0, 5);
const camera = cameraNode.addComponent(Camera);
cameraNode.addComponent(OrbitControl);

// Create sky
const sky = background.sky;
const skyMaterial = new SkyBoxMaterial(engine);
background.mode = BackgroundMode.Sky;
sky.material = skyMaterial;
sky.mesh = PrimitiveMesh.createCuboid(engine, 1, 1, 1);

// Create box
const boxEntity = rootEntity.createChild("box");
const sphereMaterial = new PBRMaterial(engine);
const renderer = boxEntity.addComponent(MeshRenderer);
renderer.mesh = PrimitiveMesh.createSphere(engine, 1, 64);
renderer.setMaterial(sphereMaterial);

engine.resourceManager
  .load<TextureCubeMap>({
    url: "https://gw.alipayobjects.com/os/bmw-prod/10c5d68d-8580-4bd9-8795-6f1035782b94.bin", // sunset_1K
    // url: "https://gw.alipayobjects.com/os/bmw-prod/20d58ffa-c7da-4c54-8980-4efaf91a0239.bin",// pisa_1K
    // url: "https://gw.alipayobjects.com/os/bmw-prod/59b28d9f-7589-4d47-86b0-52c50b973b10.bin", // footPrint_2K
    type: AssetType.HDR
  })
  .then((cubeMap) => {
    const bakedTexture = IBLBaker.fromTextureCubeMap(cubeMap, true) as any;

    ambientLight.specularMode = SpecularMode.HDR;
    // skyMaterial.textureCubeMap = bakedTexture;
    ambientLight.specularTexture = bakedTexture;

    // ambientLight.specularTexture = cubeMap;

    // const sh = new SphericalHarmonics3();
    // SphericalHarmonics3Baker.fromTextureCubeMap(cubeMap, sh, EncodingMode.RGBE);
    // ambientLight.diffuseMode = DiffuseMode.SphericalHarmonics;
    // ambientLight.diffuseSphericalHarmonics = sh;

    //debug
    gui.add(sphereMaterial, "metallicFactor", 0, 1, 0.1);
    gui.add(sphereMaterial, "roughnessFactor", 0, 10, 1);

    engine.run();
  });
