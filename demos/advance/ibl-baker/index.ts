import { EncodingMode, SphericalHarmonics3Baker } from "@oasis-engine/baker";
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
import vertex from "./vertex.js";
import frag from "./frag.js";
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
sphereMaterial.roughnessFactor = 0;
const renderer = boxEntity.addComponent(MeshRenderer);
renderer.mesh = PrimitiveMesh.createSphere(engine, 1, 64);
renderer.setMaterial(sphereMaterial);

engine.resourceManager
  .load<TextureCubeMap>({
    // url: "https://gw.alipayobjects.com/os/bmw-prod/10c5d68d-8580-4bd9-8795-6f1035782b94.bin", // sunset_1K
    // url: "https://gw.alipayobjects.com/os/bmw-prod/20d58ffa-c7da-4c54-8980-4efaf91a0239.bin",// pisa_1K
    url: "https://gw.alipayobjects.com/os/bmw-prod/59b28d9f-7589-4d47-86b0-52c50b973b10.bin", // footPrint_2K
    type: AssetType.HDR
  })
  .then((cubeMap) => {
    ambientLight.specularTexture = cubeMap;
    ambientLight.specularMode = SpecularMode.HDR;

    skyMaterial.textureCubeMap = cubeMap;
    testIBL(cubeMap);

    // const sh = new SphericalHarmonics3();
    // SphericalHarmonics3Baker.fromTextureCubeMap(cubeMap, sh, EncodingMode.RGBE);
    // ambientLight.diffuseMode = DiffuseMode.SphericalHarmonics;
    // ambientLight.diffuseSphericalHarmonics = sh;
  });

function testIBL(texture: TextureCubeMap) {
  engine.pause();

  // Test full-screen
  const iblShader = Shader.create("Oasis-IBL-baker", vertex, frag);
  const boxEntity = rootEntity.createChild("box");
  const material = new Material(engine, iblShader);
  const renderer = boxEntity.addComponent(MeshRenderer);
  renderer.mesh = PrimitiveMesh.createPlane(engine, 2, 2);
  renderer.setMaterial(material);

  const maxMipLevels = texture.mipmapCount;

  material.shaderData.setTexture("environmentMap", texture);
  material.shaderData.setVector2("textureInfo", new Vector2(256, maxMipLevels));

  const renderTarget = new RenderTarget(
    engine,
    256,
    256,
    new RenderColorTexture(engine, 256, 256, undefined, true, true),
    RenderBufferDepthFormat.Depth
  );
  boxEntity.layer = Layer.Layer10;
  camera.cullingMask = Layer.Layer10;
  camera.renderTarget = renderTarget;

  for (let face = 0; face < 6; face++) {
    for (let lod = 0; lod < maxMipLevels; lod++) {
      material.shaderData.setFloat("face", face);
      //   const roughness = lod / (maxMipLevels - 1);
      let alpha = Math.pow(2, lod) / 256;
      if (lod === 0) {
        alpha = 0;
      }
      material.shaderData.setFloat("linearRoughness", alpha);

      camera.render(TextureCubeFace.PositiveX + face, lod);
    }
  }

  //   material.shaderData.setFloat("face", 0);
  //   material.shaderData.setFloat("linearRoughness", 0);

  // revert
  camera.cullingMask = Layer.Everything;
  camera.renderTarget = null;
  boxEntity.destroy();

  const renderColorTexture: any = renderTarget.getColorTexture();
  renderColorTexture.filterMode = TextureFilterMode.Trilinear;
  ambientLight.specularTexture = renderColorTexture;
  renderTarget.destroy();

  skyMaterial.textureCubeMap = renderColorTexture;
  engine.resume();

  //debug
  gui.add(sphereMaterial, "metallicFactor", 0, 1, 0.1);
  gui.add(sphereMaterial, "roughnessFactor", 0, 10, 0.01);
}
