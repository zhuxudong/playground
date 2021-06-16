import { OrbitControl } from "@oasis-engine/controls";
import { Camera, WebGLEngine } from "oasis-engine";
import { LottieRenderer } from "@oasis-engine/lottie";

// Create engine object
const engine = new WebGLEngine("canvas");
engine.canvas.resizeByClientSize();

const scene = engine.sceneManager.activeScene;
const rootEntity = scene.createRootEntity();

// Create camera
const cameraEntity = rootEntity.createChild("Camera");
cameraEntity.transform.setPosition(0, 0, 5);
cameraEntity.addComponent(Camera);
cameraEntity.addComponent(OrbitControl);

engine.resourceManager
  .load({
    urls: [
      "https://gw.alipayobjects.com/os/OasisHub/20759aba-867f-4256-8504-935743240c78/data.json",
      "https://gw.alipayobjects.com/os/bmw-prod/083ff1ac-15d9-42cb-8d7a-5b7c39b81f5f.json",
      "https://gw.alipayobjects.com/mdn/rms_e54b79/afts/img/A*Ax4DSrekVhEAAAAAAAAAAAAAARQnAQ"
    ],
    type: "lottie"
  })
  .then((lottieEntity) => {
    rootEntity.addChild(lottieEntity);
    const lottie = lottieEntity.getComponent(LottieRenderer);
    lottie.infinite = true;
    lottie.timeScale = 1;
    lottie.play();
  });

engine.run();
