import { Camera, Logger, SystemInfo, Vector3, WebGLEngine, Entity } from "oasis-engine";
import { SpineAnimation } from "@oasis-engine/spine";

Logger.enable();

const engine = new WebGLEngine("canvas");
engine.canvas.resizeByClientSize();

const scene = engine.sceneManager.activeScene;
const rootEntity = scene.createRootEntity();

// camera
const cameraEntity = rootEntity.createChild("camera_node");
const camera = cameraEntity.addComponent(Camera);
cameraEntity.transform.position = new Vector3(0, 0, 60);

engine.resourceManager
  .load({
    url: "https://sbfkcel.github.io/pixi-spine-debug/assets/spine/spineboy-pro.json",
    type: "spine"
  })
  .then((spineEntity: Entity) => {
    spineEntity.transform.setPosition(0, -12, 0);
    rootEntity.addChild(spineEntity);
    const spineAnimation = spineEntity.getComponent(SpineAnimation);
    spineAnimation.state.setAnimation(0, "walk", true);
    spineAnimation.scale = 0.05;
  });

engine.run();
