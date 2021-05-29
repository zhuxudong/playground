import { IBLBaker, SphericalHarmonics3Baker } from "@oasis-engine/baker";
import { OrbitControl } from "@oasis-engine/controls";
import { FramebufferPicker } from "@oasis-engine/framebuffer-picker";
import {
  AssetType,
  Camera,
  DiffuseMode,
  GLTFResource,
  SphericalHarmonics3,
  TextureCubeMap,
  Vector3,
  WebGLEngine
} from "oasis-engine";

const engine = new WebGLEngine("o3-demo");
engine.canvas.resizeByClientSize();
const scene = engine.sceneManager.activeScene;
const rootEntity = scene.createRootEntity();

//-- create camera
let cameraNode = rootEntity.createChild("camera_node");
cameraNode.transform.position = new Vector3(0, 0, 30);
const camera = cameraNode.addComponent(Camera);
cameraNode.addComponent(OrbitControl);

Promise.all([
  engine.resourceManager
    .load<GLTFResource>("https://gw.alipayobjects.com/os/bmw-prod/83219f61-7d20-4704-890a-60eb92aa6159.gltf")
    .then((gltf) => {
      rootEntity.addChild(gltf.defaultSceneRoot);
      console.log(gltf);
      return gltf;
    }),
  engine.resourceManager
    .load<TextureCubeMap>({
      url: "https://gw.alipayobjects.com/os/bmw-prod/10c5d68d-8580-4bd9-8795-6f1035782b94.bin", // sunset_1K
      // url: "https://gw.alipayobjects.com/os/bmw-prod/20d58ffa-c7da-4c54-8980-4efaf91a0239.bin",// pisa_1K
      // url: "https://gw.alipayobjects.com/os/bmw-prod/59b28d9f-7589-4d47-86b0-52c50b973b10.bin" // footPrint_2K
      type: AssetType.HDR
    })
    .then((cubeMap) => {
      cubeMap = IBLBaker.fromTextureCubeMap(cubeMap) as any;
      scene.ambientLight.specularTexture = cubeMap;

      const sh = new SphericalHarmonics3();
      SphericalHarmonics3Baker.fromTextureCubeMap(cubeMap, sh);
      scene.ambientLight.diffuseMode = DiffuseMode.SphericalHarmonics;
      scene.ambientLight.diffuseSphericalHarmonics = sh;
    })
]).then((res) => {
  const gltf = <GLTFResource>res[0];

  let mesh = gltf.meshes[0];
  for (let x = 0; x < 5; x++) {
    for (let y = 0; y < 5; y++) {
      let testNode = rootEntity.createChild("test_mesh" + x + y);
      testNode.addChild(gltf.defaultSceneRoot.clone());
      testNode.transform.position = new Vector3((x - 2) * 5, (y - 2) * 5, 0);
    }
  }

  // framebuffer picker
  let lastMaterial;
  let laseBaseColor;
  let framebufferPicker = rootEntity.addComponent(FramebufferPicker);
  framebufferPicker.camera = camera;
  framebufferPicker.onPick = (obj) => {
    if (lastMaterial) lastMaterial.baseColor = laseBaseColor;

    if (obj) {
      let material = obj.component.getInstanceMaterial();

      lastMaterial = material;
      laseBaseColor = material.baseColor;
      material.baseColor.setValue(1, 0, 0, 1);
    }
  };

  document.getElementById("o3-demo").addEventListener("mousedown", (e) => {
    // console.log(e.offsetX, e.offsetY);
    framebufferPicker.pick(e.offsetX, e.offsetY);
  });
});

//-- run
engine.run();
