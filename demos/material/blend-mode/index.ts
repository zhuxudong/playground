import { OrbitControl } from "@oasis-engine/controls";
import * as dat from "dat.gui";
import { Camera, GLTFResource, PBRMaterial, Vector3, WebGLEngine } from "oasis-engine";
const gui = new dat.GUI();

// Create engine object
const engine = new WebGLEngine("canvas");
engine.canvas.resizeByClientSize();

const scene = engine.sceneManager.activeScene;
const rootEntity = scene.createRootEntity();

// Create camera
const cameraEntity = rootEntity.createChild("Camera");
cameraEntity.transform.position = new Vector3(0, 3, 10);
cameraEntity.addComponent(Camera);
cameraEntity.addComponent(OrbitControl);

scene.ambientLight.diffuseSolidColor.setValue(1, 1, 1, 1);

engine.resourceManager
  .load<GLTFResource>("https://gw.alipayobjects.com/os/bmw-prod/d099b30b-59a3-42e4-99eb-b158afa8e65d.glb")
  .then((asset) => {
    const { defaultSceneRoot, materials } = asset;
    rootEntity.addChild(defaultSceneRoot);

    const state = {
      alphaCutoff: 0,
      isTransparent: false,
      opacity: 0
    };

    // Do not debug first material
    const debugMaterials = materials.slice(1);
    gui.add(state, "alphaCutoff", 0, 1, 0.01).onChange((v) => {
      debugMaterials.forEach((material) => {
        (material as PBRMaterial).alphaCutoff = v;
      });
    });

    gui.add(state, "isTransparent").onChange((v) => {
      debugMaterials.forEach((material) => {
        (material as PBRMaterial).isTransparent = v;
      });
    });

    gui.add(state, "opacity", 0, 1, 0.01).onChange((v) => {
      debugMaterials.forEach((material) => {
        (material as PBRMaterial).baseColor.a = v;
      });
    });
  });

engine.run();
