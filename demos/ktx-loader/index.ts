import { OrbitControl } from "@oasis-engine/controls";
import { AssetType, Camera, SkyBox, SystemInfo, TextureCubeMap, Vector3, WebGLEngine } from "oasis-engine";

// Create engine object
const engine = new WebGLEngine("o3-demo");
engine.canvas.width = window.innerWidth * SystemInfo.devicePixelRatio;
engine.canvas.height = window.innerHeight * SystemInfo.devicePixelRatio;

const scene = engine.sceneManager.activeScene;
const rootEntity = scene.createRootEntity();

// Create camera
const cameraEntity = rootEntity.createChild("Camera");
cameraEntity.transform.position = new Vector3(0, 0, 50);
cameraEntity.addComponent(Camera);
cameraEntity.addComponent(OrbitControl);

engine.run();

engine.resourceManager
  .load<TextureCubeMap>({
    type: AssetType.KTX,
    url: "https://gw.alipayobjects.com/os/bmw-prod/d04974bb-b4bc-47d8-ada0-94dddadbe281.ktx"
    // url: "https://gw.alipayobjects.com/os/bmw-prod/30eb97d6-cdac-4b17-9980-fc443b2c062d.ktx"
  })
  .then((texture) => {
    rootEntity.addComponent(SkyBox).skyBoxMap = texture;
  });
