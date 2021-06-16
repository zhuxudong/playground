import { OrbitControl } from "@oasis-engine/controls";
import { AssetType, Camera, Entity, Rect, Sprite, SpriteRenderer, Texture2D, WebGLEngine } from "oasis-engine";

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
    url: "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*d3N9RYpcKncAAAAAAAAAAAAAARQnAQ",
    type: AssetType.Texture2D
  })
  .then((texture) => {
    // Create origin sprite entity.
    const spriteEntity = new Entity(engine, "spriteRegion");
    spriteEntity.transform.setScale(3, 3, 3);
    spriteEntity.addComponent(SpriteRenderer);

    const rect = new Rect();
    // Display normal.
    rect.setValue(0, 0, 1, 1);
    addRegionEntity(spriteEntity, texture, 0, 5, rect);
    // Display top left half.
    rect.setValue(0, 0, 0.5, 0.5);
    addRegionEntity(spriteEntity.clone(), texture, -7.5, -5, rect);
    // Display top right half.
    rect.setValue(0.5, 0, 1, 0.5);
    addRegionEntity(spriteEntity.clone(), texture, -2.5, -5, rect);
    // Display bottom left half.
    rect.setValue(0, 0.5, 0.5, 0.5);
    addRegionEntity(spriteEntity.clone(), texture, 2.5, -5, rect);
    // Display bottom right half.
    rect.setValue(0.5, 0.5, 1, 1);
    addRegionEntity(spriteEntity.clone(), texture, 7.5, -5, rect);
  });

engine.run();

/**
 * Add flip entity.
 */
function addRegionEntity(entity: Entity, texture: Texture2D, posX: number, posY: number, region: Rect): void {
  rootEntity.addChild(entity);
  entity.transform.setPosition(posX, posY, 0);
  const regionRenderer = entity.getComponent(SpriteRenderer);
  const sprite = new Sprite(entity.engine, texture);
  sprite.region = region;
  regionRenderer.sprite = sprite;
}
