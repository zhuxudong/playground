import { OrbitControl } from "@oasis-engine/controls";
import { AssetType, Camera, Script, SpriteRenderer, SystemInfo, Texture2D, Vector3, WebGLEngine } from "oasis-engine";

//-- script for sprite
class SpriteController extends Script {
  private _curRadian: number;
  private _radius: number;

  onAwake() {
    this._curRadian = 0;
    this._radius = 15;
  }

  onUpdate() {
    this._curRadian += 0.01;
    const { _radius, _curRadian } = this;
    const posX = Math.cos(_curRadian) * _radius;
    const posY = Math.sin(_curRadian) * _radius;
    this.entity.transform.setPosition(posX, posY, 0);
  }
}

//-- create engine object
const engine = new WebGLEngine("o3-demo");
engine.canvas.width = window.innerWidth * SystemInfo.devicePixelRatio;
engine.canvas.height = window.innerHeight * SystemInfo.devicePixelRatio;

const scene = engine.sceneManager.activeScene;
const rootEntity = scene.createRootEntity();

//-- create camera
const cameraEntity = rootEntity.createChild("camera_entity");
cameraEntity.transform.setPosition(0, 0, 50);
cameraEntity.addComponent(Camera);
cameraEntity.addComponent(OrbitControl);

//-- create sprite renderer
engine.resourceManager
  .load<Texture2D>({
    url: "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*d3N9RYpcKncAAAAAAAAAAAAAARQnAQ",
    type: AssetType.Texture2D
  })
  .then((resource) => {
    for (let i = 0; i < 10; ++i) {
      setTimeout(() => {
        const spriteEntity = rootEntity.createChild(`sprite_${i}`);
        spriteEntity.transform.position = new Vector3(0, 0, 0);
        const spriteComponent = spriteEntity.addComponent(SpriteRenderer);
        spriteComponent.texture = resource;
        const rect = spriteComponent.rect;
        const scaleX = 100.0 / rect.width;
        const scaleY = 100.0 / rect.height;
        spriteEntity.transform.setScale(scaleX, scaleY, 1);
        spriteEntity.addComponent(SpriteController);
      }, 1000 * i);
    }
  });

engine.run();
