import { OrbitControl } from "@oasis-engine/controls";
import { Camera, Color, DirectLight, Entity, GLTFResource, Script, WebGLEngine } from "oasis-engine";

init();

/**
 * Init demo.
 */
function init(): void {
  // Create engine
  const engine = new WebGLEngine("canvas");
  engine.canvas.resizeByClientSize();

  // Create yellow duck
  engine.resourceManager
    .load<GLTFResource>("https://gw.alipayobjects.com/os/OasisHub/267000040/9994/%25E5%25BD%2592%25E6%25A1%25A3.gltf")
    .then((gltf) => {
      // Create root entity.
      const rootEntity = engine.sceneManager.activeScene.createRootEntity();

      // Create camera.
      const cameraEntity = rootEntity.createChild("CameraEntity");
      cameraEntity.transform.setPosition(0, 3, 9);
      cameraEntity.addComponent(Camera);
      cameraEntity.addComponent(OrbitControl);

      // Create light.
      const lightEntity = rootEntity.createChild("LightEntity");
      const directLight = lightEntity.addComponent(DirectLight);
      directLight.color = new Color(0.8, 0.8, 0.8);

      // Create three duck modles, set rotation and position.
      const duck0 = gltf.defaultSceneRoot;
      duck0.transform.rotate(0, -45, 0);

      const duck1 = duck0.clone();
      const duck2 = duck0.clone();
      duck1.transform.setPosition(-3, 0, 0);
      duck2.transform.setPosition(3, 0, 0);

      // Create root entity and add transform script.
      const script = rootEntity.addComponent(TransformScript);
      script.duck0 = duck0;
      script.duck1 = duck1;
      script.duck2 = duck2;

      // Add ducks to scene.
      rootEntity.addChild(duck0);
      rootEntity.addChild(duck1);
      rootEntity.addChild(duck2);

      //Run engine.
      engine.run();
    });
}

/**
 * Script for updating ducks position, rotation, and scale.
 */
class TransformScript extends Script {
  /** Duck0. */
  duck0: Entity;
  /** Duck1. */
  duck1: Entity;
  /** Duck2. */
  duck2: Entity;

  private _totalTime: number = 0;

  /**
   * @override
   * The main loop, called frame by frame.
   * @param deltaTime - The deltaTime when the script update.
   */
  onUpdate(deltaTime: number): void {
    this._totalTime += deltaTime;
    const sinFactor = Math.sin(this._totalTime / 500);

    // Update duck0's position.
    const positionFactor = Math.max(sinFactor, 0);
    this.duck0.transform.setPosition(0, positionFactor, 0);

    // Update duck1's roatation.
    const rotateFactor = this._totalTime * 0.1;
    this.duck1.transform.setRotation(0, rotateFactor, 0);

    // Update duck2's scale.
    const scaleFactor = (sinFactor + 1.0) * 0.01;
    this.duck2.transform.setScale(scaleFactor, scaleFactor, scaleFactor);
  }
}
