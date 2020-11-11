/**
 * 本示例展示如何使用几何体渲染器功能、如何创建几何体资源对象、如何创建材质对象
 */
import { FreeControl } from "@oasis-engine/controls";
import {
  Buffer,
  BufferBindFlag,
  BufferGeometry,
  BufferUsage,
  Camera,
  ConstantMaterial,
  Engine,
  GeometryRenderer,
  IndexFormat,
  PlaneGeometry,
  PrimitiveTopology,
  Vector4,
  VertexElement,
  VertexElementFormat,
  WebGLEngine
} from "oasis-engine";

// 创建引擎、获取场景根节点
// canvas.width = window.innerWidth * SystemInfo.devicePixelRatio;
// canvas.height = window.innerHeight * SystemInfo.devicePixelRatio;

let engine = new WebGLEngine("o3-demo");
engine.canvas.resizeByClientSize();
const scene = engine.sceneManager.activeScene;
const rootNode = scene.createRootEntity("root");

// 在场景中创建相机节点、配置位置和目标方向
const cameraNode = rootNode.createChild("camera_node");
cameraNode.transform.setPosition(0, 0, 20);

const camera = cameraNode.addComponent(Camera);
camera.farClipPlane = 2000;

const controler = cameraNode.addComponent(FreeControl);
controler.movementSpeed = 100;
controler.rotateSpeed = 1;
controler.jumpY = 50;

const geometry = createCubeGeometry(engine, 50);
const material = new ConstantMaterial(engine, "box");
material.emission = new Vector4(0.5, 0, 0, 1);

let groundGeometry = new PlaneGeometry(engine, 2000, 2000, 100, 100);
groundGeometry.subGeometry.topology = PrimitiveTopology.LineStrip;
let groundMaterial = new ConstantMaterial(engine, "groundMat");
groundMaterial.emission = new Vector4(1, 1, 1, 1);

// meshes in scene
for (let i = 0; i < 100; i++) {
  let cube = rootNode.createChild("cube");
  cube.transform.setPosition(Math.random() * 2000 - 1000, Math.random() * 200, Math.random() * 2000 - 1000);
  const cubeRenderer = cube.addComponent(GeometryRenderer);
  cubeRenderer.geometry = geometry;
  cubeRenderer.material = material;
}

// ground
let ground = rootNode.createChild("ground");
ground.transform.setPosition(0, -25, 0);
ground.transform.rotateXYZ(-90, 0, 0);
let groundRender = ground.addComponent(GeometryRenderer);
groundRender.geometry = groundGeometry;
groundRender.material = groundMaterial;

// 启动引擎
engine.run();

/** ------ geometry.ts ---------*/

/**
 * 创建立方体几何体。
 * @param engine - 引擎
 * @param size - 尺寸
 */
function createCubeGeometry(engine: Engine, size: number): BufferGeometry {
  const geometry = new BufferGeometry(engine, "cubeGeometry");

  // prettier-ignore
  const vertices =new Float32Array( [
    -size / 2, -size / 2, -size / 2,  0, 0, 0,
    size / 2, -size / 2, -size / 2,  1, 0, 0,
    -size / 2, size / 2, -size / 2,  0, 1, 0,
    size / 2, size / 2, -size / 2,  1, 1, 0,
    -size / 2, -size / 2, size / 2,  0, 0, 1,
    size / 2, -size / 2, size / 2,  1, 0, 1,
    -size / 2, size / 2, size / 2,  0, 1, 1,
    size / 2, size / 2, size / 2,  1, 1, 1
  ]);
  // prettier-ignore
  const indices =new Uint8Array( [
    0, 2, 1, 3, 1, 2,
    0, 4, 2, 6, 2, 4,
    5, 1, 7, 3, 7, 1,
    6, 7, 2, 3, 2, 7,
    0, 1, 4, 5, 4, 1,
    4, 5, 6, 7, 6, 5
  ]);

  const vertexBuffer = new Buffer(engine, BufferBindFlag.VertexBuffer, vertices, BufferUsage.Static);
  const indexBuffer = new Buffer(engine, BufferBindFlag.IndexBuffer, indices, BufferUsage.Static);

  // bind buffer
  geometry.setVertexBufferBinding(vertexBuffer, 24);
  geometry.setIndexBufferBinding(indexBuffer, IndexFormat.UInt8);

  // add vertexElement
  geometry.setVertexElements([
    new VertexElement("POSITION", 0, VertexElementFormat.Vector3, 0),
    new VertexElement("COLOR", 12, VertexElementFormat.Vector3, 0)
  ]);

  //set drawCount
  geometry.addSubGeometry(0, indices.length);
  return geometry;
}
