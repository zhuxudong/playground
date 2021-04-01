import { OrbitControl } from "@oasis-engine/controls";
import * as dat from "dat.gui";
import {
  AssetType,
  Camera,
  EnvironmentMapLight,
  MeshRenderer,
  PBRMaterial,
  PrimitiveMesh,
  SkyBox,
  SystemInfo,
  TextureCubeMap,
  Vector3,
  WebGLEngine
} from "oasis-engine";

/**
 * use PBR material
 */
function usePBR(rows = 8, cols = 8, radius = 1, gap = 1) {
  const deltaGap = radius * 2 + gap;
  const minX = (-deltaGap * (cols - 1)) / 2;
  const maxY = (deltaGap * (rows - 1)) / 2;
  const deltaMetal = 1 / (cols - 1);
  const deltaRoughness = 1 / (rows - 1);
  const materials: PBRMaterial[] = new Array(rows * cols);

  // create materials
  for (let i = 0, count = rows * cols; i < count; i++) {
    materials[i] = new PBRMaterial(engine);
  }

  // create model mesh
  const mesh = PrimitiveMesh.createSphere(engine, radius, 64);

  // create renderer
  for (let i = 0, count = rows * cols; i < count; i++) {
    const entity = rootEntity.createChild();
    const renderer = entity.addComponent(MeshRenderer);
    const currentRow = Math.floor(i / cols);
    const currentCol = i % cols;
    const material = materials[i];
    renderer.mesh = mesh;
    renderer.setMaterial(material);

    entity.transform.setPosition(minX + currentCol * deltaGap, maxY - currentRow * deltaGap, 0);

    // pbr metallic
    material.metallicFactor = deltaMetal * currentCol;
    // pbr roughness
    material.roughnessFactor = deltaRoughness * currentRow;
  }
}

const gui = new dat.GUI();
const guiDebug = {
  env: "road",
  introX: "从左到右金属度递增",
  introY: "从上到下粗糙度递增"
};
gui.add(guiDebug, "introX");
gui.add(guiDebug, "introY");

// create engine object
const engine = new WebGLEngine("o3-demo");
engine.canvas.width = window.innerWidth * SystemInfo.devicePixelRatio;
engine.canvas.height = window.innerHeight * SystemInfo.devicePixelRatio;

const scene = engine.sceneManager.activeScene;
const rootEntity = scene.createRootEntity();

// create camera
const cameraEntity = rootEntity.createChild("camera_entity");
cameraEntity.transform.position = new Vector3(0, 0, 30);
cameraEntity.addComponent(Camera);
const control = cameraEntity.addComponent(OrbitControl);
control.maxDistance = 30;
control.minDistance = 30;

// create skybox
const skybox = rootEntity.addComponent(SkyBox);

// create env light
const envLight = rootEntity.addComponent(EnvironmentMapLight);

// load env texture
engine.resourceManager
  .load([
    {
      urls: [
        "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*5w6_Rr6ML6IAAAAAAAAAAAAAARQnAQ",
        "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*TiT2TbN5cG4AAAAAAAAAAAAAARQnAQ",
        "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*8GF6Q4LZefUAAAAAAAAAAAAAARQnAQ",
        "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*D5pdRqUHC3IAAAAAAAAAAAAAARQnAQ",
        "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*_FooTIp6pNIAAAAAAAAAAAAAARQnAQ",
        "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*CYGZR7ogZfoAAAAAAAAAAAAAARQnAQ"
      ],
      type: AssetType.TextureCube
    },
    {
      urls: [
        "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*4ebgQaWOLaIAAAAAAAAAAAAAARQnAQ",
        "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*i56eR6AbreUAAAAAAAAAAAAAARQnAQ",
        "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*3wYERKsel5oAAAAAAAAAAAAAARQnAQ",
        "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*YiG7Srwmb3QAAAAAAAAAAAAAARQnAQ",
        "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*VUUwQrAv47sAAAAAAAAAAAAAARQnAQ",
        "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*Dn2qSoqzfwoAAAAAAAAAAAAAARQnAQ"
      ],
      type: AssetType.TextureCube
    }
  ])
  .then((cubeMaps: TextureCubeMap[]) => {
    envLight.specularTexture = cubeMaps[1];
    skybox.skyBoxMap = cubeMaps[1];
    gui.add(guiDebug, "env", ["forrest", "road"]).onChange((v) => {
      switch (v) {
        case "forrest":
          envLight.specularTexture = cubeMaps[0];
          skybox.skyBoxMap = cubeMaps[0];
          break;
        case "road":
          envLight.specularTexture = cubeMaps[1];
          skybox.skyBoxMap = cubeMaps[1];
          break;
      }
    });
  });

// run engine
engine.run();

// show pbr materials
usePBR();
