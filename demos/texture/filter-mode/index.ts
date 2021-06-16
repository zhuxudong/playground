import { OrbitControl } from "@oasis-engine/controls";
import * as dat from "dat.gui";
import {
  AssetType,
  Camera,
  MeshRenderer,
  PrimitiveMesh,
  RenderFace,
  Texture2D,
  TextureFilterMode,
  UnlitMaterial,
  WebGLEngine
} from "oasis-engine";
const gui = new dat.GUI();

// Create engine object
const engine = new WebGLEngine("canvas");
engine.canvas.resizeByClientSize();

const scene = engine.sceneManager.activeScene;
const rootEntity = scene.createRootEntity();

// Create camera
const cameraEntity = rootEntity.createChild("Camera");
cameraEntity.transform.setPosition(0, 0, 1);
cameraEntity.addComponent(Camera);
cameraEntity.addComponent(OrbitControl);

// Create Plane
const mesh = PrimitiveMesh.createPlane(engine, 2, 2);
const material = new UnlitMaterial(engine);
material.renderFace = RenderFace.Double;
const planeEntity = rootEntity.createChild("ground");
planeEntity.transform.setRotation(-85, 0, 0);
const planeRenderer = planeEntity.addComponent(MeshRenderer);
planeRenderer.mesh = mesh;
planeRenderer.setMaterial(material);

engine.resourceManager
  .load<Texture2D>({
    url: "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*aHXyTqXu1_IAAAAAAAAAAAAAARQnAQ",
    type: AssetType.Texture2D
  })
  .then((texture) => {
    material.baseTexture = texture;
    addGUI(texture);
  });

function addGUI(texture: Texture2D) {
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
