import { OrbitControl } from "@oasis-engine/controls";
import {
  BlinnPhongMaterial,
  Camera,
  Color,
  DirectLight,
  MeshRenderer,
  MeshTopology,
  ModelMesh,
  Vector3,
  WebGLEngine
} from "oasis-engine";

const engine = new WebGLEngine("canvas");
engine.canvas.resizeByClientSize();
const scene = engine.sceneManager.activeScene;
const rootEntity = scene.createRootEntity();

// init camera
const cameraEntity = rootEntity.createChild("camera");
cameraEntity.addComponent(Camera);
cameraEntity.addComponent(OrbitControl);
cameraEntity.transform.setPosition(0.5, 0.5, 0.5);
cameraEntity.transform.lookAt(new Vector3(0, 0, 0));

// init light
rootEntity.addComponent(DirectLight);

fetch("https://gw.alipayobjects.com/os/bmw-prod/b885a803-5315-44f0-af54-6787ec47ed1b.obj")
  .then((res) => res.text())
  .then((objText) => {
    const lines = objText.split(/\n/);
    const positions = [];
    const indices: number[] = [];
    lines
      .map((lineText) => lineText.split(" "))
      .forEach((parseTexts) => {
        if (parseTexts[0] === "v") {
          positions.push(new Vector3(parseFloat(parseTexts[1]), parseFloat(parseTexts[2]), parseFloat(parseTexts[3])));
        } else if (parseTexts[0] === "f") {
          indices.push(parseInt(parseTexts[1]) - 1, parseInt(parseTexts[2]) - 1, parseInt(parseTexts[3]) - 1);
        }
      });

    const mesh = new ModelMesh(engine);
    mesh.setPositions(positions);
    mesh.setIndices(Uint16Array.from(indices));
    mesh.addSubMesh(0, indices.length, MeshTopology.Triangles);
    mesh.uploadData(false);

    // init cube
    const cubeEntity = rootEntity.createChild("cube");
    const renderer = cubeEntity.addComponent(MeshRenderer);
    renderer.mesh = mesh;
    const material = new BlinnPhongMaterial(engine);
    material.baseColor = new Color(1, 0.25, 0.25, 1);
    renderer.setMaterial(material);
  });

engine.run();
