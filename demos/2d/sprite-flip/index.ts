import { OrbitControl } from "@oasis-engine/controls";
import { AssetType, Camera, Entity, Sprite, SpriteRenderer, Texture2D, WebGLEngine } from "oasis-engine";

// Create engine object.
const engine = new WebGLEngine("canvas");
engine.canvas.resizeByClientSize();

// Create root entity.
const rootEntity = engine.sceneManager.activeScene.createRootEntity();

// Create camera.
const cameraEntity = rootEntity.createChild("Camera");
cameraEntity.transform.setPosition(0, 0, 50);
cameraEntity.addComponent(Camera);
cameraEntity.addComponent(OrbitControl);

engine.resourceManager
  .load<Texture2D>({
    url: "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*KjnzTpE8LdAAAAAAAAAAAAAAARQnAQ",
    type: AssetType.Texture2D
  })
  .then((texture) => {
    // Create origin sprite entity.
    const spriteEntity = new Entity(engine, "spriteFlip");
    const spriteRenderer = spriteEntity.addComponent(SpriteRenderer);
    spriteRenderer.sprite = new Sprite(engine, texture);

    // Display mormal.
    addFlipEntity(spriteEntity, -15, false, false);
    // Display flip x.
    addFlipEntity(spriteEntity.clone(), -5, true, false);
    // Display flip y.
    addFlipEntity(spriteEntity.clone(), 5, false, true);
    // Display flip x and y.
    addFlipEntity(spriteEntity.clone(), 15, true, true);
  });

engine.run();

/**
 * Add flip entity.
 */
function addFlipEntity(entity: Entity, posX: number, flipX: boolean, flipY: boolean): void {
  rootEntity.addChild(entity);
  entity.transform.setPosition(posX, 0, 0);
  const flipRenderer = entity.getComponent(SpriteRenderer);
  flipRenderer.flipX = flipX;
  flipRenderer.flipY = flipY;
}
