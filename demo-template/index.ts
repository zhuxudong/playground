import { OrbitControl } from "@oasis-engine/controls";
import { Camera, SystemInfo, WebGLEngine } from "oasis-engine";

//-- create engine object
const engine = new WebGLEngine("o3-demo");
engine.canvas.width = window.innerWidth * SystemInfo.devicePixelRatio;
engine.canvas.height = window.innerHeight * SystemInfo.devicePixelRatio;

const scene = engine.sceneManager.activeScene;
const rootEntity = scene.createRootEntity();

//-- create camera
const cameraNode = rootEntity.createChild("camera_node");
cameraNode.addComponent(Camera);
cameraNode.addComponent(OrbitControl);

engine.run();
