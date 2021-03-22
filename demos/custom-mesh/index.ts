import {
  AmbientLight,
  BlinnPhongMaterial,
  Buffer,
  BufferBindFlag,
  BufferUsage,
  Camera,
  Color,
  DirectLight,
  Engine,
  IndexFormat,
  Mesh,
  MeshRenderer,
  SystemInfo,
  Vector3,
  VertexElement,
  VertexElementFormat,
  WebGLEngine
} from "oasis-engine";

<<<<<<< HEAD:demos/custom-mesh/index.ts
// Create engine and get root entity.
=======
/**
 * To create custom cube geometry.
 */
class CustomCubeMesh {
  /**
   * create cube geometry with custom BufferGeometry.
   * @param size - cube size
   */
  static create(engine: Engine, size: number): Mesh {
    const mesh = new Mesh(engine, "CustomCubeMesh");

    // prettier-ignore
    // create vertices data.
    const vertices: Float32Array = new Float32Array([
    	// up
    	-size, size, -size, 0, 1, 0, size, size, -size, 0, 1, 0, size, size, size, 0, 1, 0, -size, size, size, 0, 1, 0,
    	// down
    	-size, -size, -size, 0, -1, 0, size, -size, -size, 0, -1, 0, size, -size, size, 0, -1, 0, -size, -size, size, 0, -1, 0,
    	// left
    	-size, size, -size, -1, 0, 0, -size, size, size, -1, 0, 0, -size, -size, size, -1, 0, 0, -size, -size, -size, -1, 0, 0,
    	// right
    	size, size, -size, 1, 0, 0, size, size, size, 1, 0, 0, size, -size, size, 1, 0, 0, size, -size, -size, 1, 0, 0,
    	// front
    	-size, size, size, 0, 0, 1, size, size, size, 0, 0, 1, size, -size, size, 0, 0, 1, -size, -size, size, 0, 0, 1,
    	// back
    	-size, size, -size, 0, 0, -1, size, size, -size, 0, 0, -1, size, -size, -size, 0, 0, -1, -size, -size, -size, 0, 0, -1]);

    // prettier-ignore
    // create indices data.
    const indices: Uint16Array = new Uint16Array([
    	// up
    	0, 2, 1, 2, 0, 3,
    	// down
    	4, 6, 7, 6, 4, 5,
    	// left
    	8, 10, 9, 10, 8, 11,
    	// right
    	12, 14, 15, 14, 12, 13,
    	// front
    	16, 18, 17, 18, 16, 19,
    	// back
    	20, 22, 23, 22, 20, 21]);

    // create gpu vertex buffer and index buffer.
    const vertexBuffer = new Buffer(engine, BufferBindFlag.VertexBuffer, vertices, BufferUsage.Static);
    const indexBuffer = new Buffer(engine, BufferBindFlag.IndexBuffer, indices, BufferUsage.Static);

    // bind buffer
    mesh.setVertexBufferBinding(vertexBuffer, 24);
    mesh.setIndexBufferBinding(indexBuffer, IndexFormat.UInt16);

    // add vertexElement
    mesh.setVertexElements([
      new VertexElement("POSITION", 0, VertexElementFormat.Vector3, 0),
      new VertexElement("NORMAL", 12, VertexElementFormat.Vector3, 0)
    ]);

    // add one sub geometry.
    mesh.addSubMesh(0, indices.length);
    return mesh;
  }
}

// create engine and get root entity.
>>>>>>> 14589a89d4fcde728d4c5193b56d9237415f9537:demos/buffer-geometry/index.ts
const engine = new WebGLEngine("o3-demo");
const canvas = engine.canvas;
const rootEntity = engine.sceneManager.activeScene.createRootEntity("Root");
canvas.width = window.innerWidth * SystemInfo.devicePixelRatio;
canvas.height = window.innerHeight * SystemInfo.devicePixelRatio;

// Create light.
const lightEntity = rootEntity.createChild("DirectLight");
const ambient = lightEntity.addComponent(AmbientLight);
const directLight = lightEntity.addComponent(DirectLight);
ambient.color = new Color(0.2, 0.2, 0.2);
directLight.color = new Color(0.3, 0.4, 0.4);

// Create camera.
const cameraEntity = rootEntity.createChild("Camera");
cameraEntity.transform.setPosition(0, 6, 10);
cameraEntity.transform.lookAt(new Vector3(0, 0, 0));
cameraEntity.addComponent(Camera);

// Create custom cube.
// Use createCustomMesh() to create custom cube mesh.
const cubeEntity = rootEntity.createChild("Cube");
const cubeRenderer = cubeEntity.addComponent(MeshRenderer);
<<<<<<< HEAD:demos/custom-mesh/index.ts
const cubeGeometry = createCustomMesh(engine, 1.0);
=======
const cubeGeometry = CustomCubeMesh.create(engine, 1.0);
>>>>>>> 14589a89d4fcde728d4c5193b56d9237415f9537:demos/buffer-geometry/index.ts
const material = new BlinnPhongMaterial(engine);
cubeEntity.transform.rotate(0, 60, 0);
cubeRenderer.mesh = cubeGeometry;
cubeRenderer.setMaterial(material);

// Run engine.
engine.run();

/**
 * Create cube geometry with custom BufferGeometry.
 * @param engine - Engine
 * @param size - Cube size
 * @returns Cube mesh
 */
function createCustomMesh(engine: Engine, size: number): Mesh {
  const geometry = new Mesh(engine, "CustomCubeGeometry");

  // prettier-ignore
  // Create vertices data.
  const vertices: Float32Array = new Float32Array([
    	// Up
    	-size, size, -size, 0, 1, 0, size, size, -size, 0, 1, 0, size, size, size, 0, 1, 0, -size, size, size, 0, 1, 0,
    	// Down
    	-size, -size, -size, 0, -1, 0, size, -size, -size, 0, -1, 0, size, -size, size, 0, -1, 0, -size, -size, size, 0, -1, 0,
    	// Left
    	-size, size, -size, -1, 0, 0, -size, size, size, -1, 0, 0, -size, -size, size, -1, 0, 0, -size, -size, -size, -1, 0, 0,
    	// Right
    	size, size, -size, 1, 0, 0, size, size, size, 1, 0, 0, size, -size, size, 1, 0, 0, size, -size, -size, 1, 0, 0,
    	// Front
    	-size, size, size, 0, 0, 1, size, size, size, 0, 0, 1, size, -size, size, 0, 0, 1, -size, -size, size, 0, 0, 1,
    	// Back
    	-size, size, -size, 0, 0, -1, size, size, -size, 0, 0, -1, size, -size, -size, 0, 0, -1, -size, -size, -size, 0, 0, -1]);

  // prettier-ignore
  // Create indices data.
  const indices: Uint16Array = new Uint16Array([
    	// Up
    	0, 2, 1, 2, 0, 3,
    	// Down
    	4, 6, 7, 6, 4, 5,
    	// Left
    	8, 10, 9, 10, 8, 11,
    	// Right
    	12, 14, 15, 14, 12, 13,
    	// Front
    	16, 18, 17, 18, 16, 19,
    	// Back
    	20, 22, 23, 22, 20, 21]);

  // Create gpu vertex buffer and index buffer.
  const vertexBuffer = new Buffer(engine, BufferBindFlag.VertexBuffer, vertices, BufferUsage.Static);
  const indexBuffer = new Buffer(engine, BufferBindFlag.IndexBuffer, indices, BufferUsage.Static);

  // Bind buffer
  geometry.setVertexBufferBinding(vertexBuffer, 24);
  geometry.setIndexBufferBinding(indexBuffer, IndexFormat.UInt16);

  // Add vertexElement
  geometry.setVertexElements([
    new VertexElement("POSITION", 0, VertexElementFormat.Vector3, 0),
    new VertexElement("NORMAL", 12, VertexElementFormat.Vector3, 0)
  ]);

  // Add one sub geometry.
  geometry.addSubMesh(0, indices.length);
  return geometry;
}
