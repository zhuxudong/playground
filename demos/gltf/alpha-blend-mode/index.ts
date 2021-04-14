import { OrbitControl } from "@oasis-engine/controls";
import { Camera, DirectLight, EnvironmentMapLight, GLTFResource, SystemInfo, Vector3, WebGLEngine } from "oasis-engine";

// Create engine object
const engine = new WebGLEngine("o3-demo", { alpha: false });
engine.canvas.width = window.innerWidth * SystemInfo.devicePixelRatio;
engine.canvas.height = window.innerHeight * SystemInfo.devicePixelRatio;

const scene = engine.sceneManager.activeScene;
const rootEntity = scene.createRootEntity();

// Create camera
const cameraEntity = rootEntity.createChild("Camera");
cameraEntity.transform.position = new Vector3(0, 2, 8);
cameraEntity.addComponent(Camera);
cameraEntity.addComponent(OrbitControl);

// Create  Light
rootEntity.addComponent(EnvironmentMapLight);
const dirEntity = rootEntity.createChild("dirEntity");
dirEntity.transform.rotate(-30, 0, 0);
dirEntity.addComponent(DirectLight).intensity = 0.5;

engine.run();

engine.resourceManager
  .load<GLTFResource>("https://gw.alipayobjects.com/os/bmw-prod/d099b30b-59a3-42e4-99eb-b158afa8e65d.glb")
  .then((asset) => {
    const { defaultSceneRoot } = asset;
    rootEntity.addChild(defaultSceneRoot);
  });
