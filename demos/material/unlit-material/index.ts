import { OrbitControl } from "@oasis-engine/controls";
import { Animation, Camera, GLTFResource, Vector3, WebGLEngine } from "oasis-engine";

// Create engine object
const engine = new WebGLEngine("o3-demo");
engine.canvas.resizeByClientSize();

const scene = engine.sceneManager.activeScene;
const rootEntity = scene.createRootEntity();

// Create camera
const cameraEntity = rootEntity.createChild("Camera");
cameraEntity.transform.position = new Vector3(0, 0, 5);
cameraEntity.addComponent(Camera);
cameraEntity.addComponent(OrbitControl);

engine.run();

engine.resourceManager
  .load<GLTFResource>("https://gw.alipayobjects.com/os/bmw-prod/8d36415b-5905-461f-9336-68a23d41518e.gltf")
  .then((gltf) => {
    const { materials, animations, defaultSceneRoot } = gltf;
    rootEntity.addChild(defaultSceneRoot);

    const animator = defaultSceneRoot.getComponent(Animation);
    animator.playAnimationClip(animations[0].name);

    console.log(materials);
  });
