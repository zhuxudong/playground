import { OrbitControl } from "@oasis-engine/controls";
import { Animation, Camera, EnvironmentMapLight, GLTFResource, SystemInfo, Vector3, WebGLEngine } from "oasis-engine";

// Create engine object
const engine = new WebGLEngine("o3-demo");
engine.canvas.width = window.innerWidth * SystemInfo.devicePixelRatio;
engine.canvas.height = window.innerHeight * SystemInfo.devicePixelRatio;

const scene = engine.sceneManager.activeScene;
const rootEntity = scene.createRootEntity();

// Create camera
const cameraEntity = rootEntity.createChild("Camera");
cameraEntity.transform.position = new Vector3(0, 5, 5);
cameraEntity.addComponent(Camera);
cameraEntity.addComponent(OrbitControl);

// Create Env Light
rootEntity.addComponent(EnvironmentMapLight)

engine.run();

engine.resourceManager
  .load<GLTFResource>("https://gw.alipayobjects.com/os/bmw-prod/8cc524dd-2481-438d-8374-3c933adea3b6.gltf")
  .then((asset) => {
    const { animations, defaultSceneRoot } = asset;
    rootEntity.addChild(defaultSceneRoot);

    const animator = defaultSceneRoot.getComponent(Animation);
    animator.playAnimationClip(animations[0].name);
  });
