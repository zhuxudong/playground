import { OrbitControl } from "@oasis-engine/controls";
import * as dat from "dat.gui";
import {
  AssetType,
  BaseMaterial,
  Camera,
  DiffuseMode,
  GLTFResource,
  PBRMaterial,
  TextureCubeMap,
  Vector3,
  WebGLEngine
} from "oasis-engine";
const gui = new dat.GUI();

// Create engine object
const engine = new WebGLEngine("o3-demo");
engine.canvas.resizeByClientSize();

const scene = engine.sceneManager.activeScene;
const rootEntity = scene.createRootEntity();

// Create camera
const cameraEntity = rootEntity.createChild("Camera");
cameraEntity.transform.position = new Vector3(0, 3, 10);
cameraEntity.addComponent(Camera);
cameraEntity.addComponent(OrbitControl);

// Load resources
engine.resourceManager
  .load<TextureCubeMap>({
    urls: [
      "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*Bk5FQKGOir4AAAAAAAAAAAAAARQnAQ",
      "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*_cPhR7JMDjkAAAAAAAAAAAAAARQnAQ",
      "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*trqjQp1nOMQAAAAAAAAAAAAAARQnAQ",
      "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*_RXwRqwMK3EAAAAAAAAAAAAAARQnAQ",
      "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*q4Q6TroyuXcAAAAAAAAAAAAAARQnAQ",
      "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*DP5QTbTSAYgAAAAAAAAAAAAAARQnAQ"
    ],
    type: AssetType.TextureCube
  })
  .then((cubeMap) => {
    scene.ambientLight.diffuseMode = DiffuseMode.Texture;
    scene.ambientLight.diffuseTexture = cubeMap;
  }),
  engine.resourceManager
    .load<TextureCubeMap>({
      urls: [
        "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*5w6_Rr6ML6IAAAAAAAAAAAAAARQnAQ",
        "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*TiT2TbN5cG4AAAAAAAAAAAAAARQnAQ",
        "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*8GF6Q4LZefUAAAAAAAAAAAAAARQnAQ",
        "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*D5pdRqUHC3IAAAAAAAAAAAAAARQnAQ",
        "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*_FooTIp6pNIAAAAAAAAAAAAAARQnAQ",
        "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*CYGZR7ogZfoAAAAAAAAAAAAAARQnAQ"
      ],
      type: AssetType.TextureCube
    })
    .then((cubeMap) => {
      scene.ambientLight.specularTexture = cubeMap;
    });

engine.resourceManager
  .load<GLTFResource>("https://gw.alipayobjects.com/os/bmw-prod/d099b30b-59a3-42e4-99eb-b158afa8e65d.glb")
  .then((asset) => {
    const { defaultSceneRoot, materials } = asset;
    rootEntity.addChild(defaultSceneRoot);

    const state = {
      alphaCutoff: 0,
      isTransparent: false,
      opacity: 0
    };

    let debugMaterials = materials.slice(1);
    gui.add(state, "alphaCutoff", 0, 1, 0.01).onChange((v) => {
      debugMaterials.forEach((material) => {
        (material as PBRMaterial).alphaCutoff = v;
      });
    });

    gui.add(state, "isTransparent").onChange((v) => {
      debugMaterials.forEach((material) => {
        (material as PBRMaterial).isTransparent = v;
      });
    });

    gui.add(state, "opacity", 0, 1, 0.01).onChange((v) => {
      debugMaterials.forEach((material) => {
        (material as PBRMaterial).baseColor.a = v;
      });
    });
  });

engine.run();
