import { OrbitControl } from "@oasis-engine/controls";
import * as dat from "dat.gui";
import {
  AssetType,
  Camera,
  CullMode,
  MeshRenderer,
  PBRMaterial,
  PrimitiveMesh,
  TextureCubeMap,
  TextureFilterMode,
  WebGLEngine
} from "oasis-engine";
const gui = new dat.GUI();

// Create engine object
const engine = new WebGLEngine("o3-demo");
engine.canvas.resizeByClientSize();

const scene = engine.sceneManager.activeScene;
const rootEntity = scene.createRootEntity();

// Create camera
const cameraEntity = rootEntity.createChild("Camera");
cameraEntity.transform.setPosition(0, 0, 5);
cameraEntity.addComponent(Camera);
cameraEntity.addComponent(OrbitControl);

// Create Plane
const mesh = PrimitiveMesh.createPlane(engine, 2, 2);
const material = new PBRMaterial(engine);
material.roughnessFactor = 0;
material.metallicFactor = 1;
material.renderState.rasterState.cullMode = CullMode.Off;
const planeEntity = rootEntity.createChild("ground");
const planeRenderer = planeEntity.addComponent(MeshRenderer);
planeRenderer.mesh = mesh;
planeRenderer.setMaterial(material);

engine.resourceManager
  .load<TextureCubeMap>({
    urls: [
      "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*5w6_Rr6ML6IAAAAAAAAAAAAAARQnAQ",
      "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*TiT2TbN5cG4AAAAAAAAAAAAAARQnAQ",
      "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*8GF6Q4LZefUAAAAAAAAAAAAAARQnAQ",
      "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*D5pdRqUHC3IAAAAAAAAAAAAAARQnAQ",
      "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*_FooTIp6pNIAAAAAAAAAAAAAARQnAQ",
      "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*CYGZR7ogZfoAAAAAAAAAAAAAARQnAQ"
    ],
    type: AssetType.TextureCube
  })
  .then((texture) => {
    scene.ambientLight.specularTexture = texture;
    addGUI(texture);
  });

function addGUI(texture: TextureCubeMap) {
  const filterMap: Record<TextureFilterMode, string> = {
    [TextureFilterMode.Point]: "Point",
    [TextureFilterMode.Bilinear]: "Bilinear",
    [TextureFilterMode.Trilinear]: "Trilinear"
  };
  const state = {
    filterMode: filterMap[texture.filterMode]
  };
  gui.add(state, "filterMode", Object.values(filterMap)).onChange((v) => {
    for (let key in filterMap) {
      const value = filterMap[key];
      if (v === value) {
        texture.filterMode = Number(key);
      }
    }
  });
}

engine.run();
