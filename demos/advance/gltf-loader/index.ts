import { OrbitControl } from "@oasis-engine/controls";
import "@oasis-engine/stats";
import * as dat from "dat.gui";
import {
  Animation,
  AnimationClip,
  AssetType,
  BackgroundMode,
  BoundingBox,
  Camera,
  Color,
  Entity,
  GLTFResource,
  Logger,
  Material,
  MeshRenderer,
  PBRBaseMaterial,
  PBRMaterial,
  PBRSpecularMaterial,
  PointLight,
  PrimitiveMesh,
  Renderer,
  Scene,
  SkinnedMeshRenderer,
  SkyBoxMaterial,
  Texture2D,
  TextureCubeMap,
  UnlitMaterial,
  Vector3,
  WebGLEngine
} from "oasis-engine";

Logger.enable();

const envList = {
  sky: [
    "https://gw.alipayobjects.com/mdn/rms_475770/afts/img/A*Gi7CTZqKuacAAAAAAAAAAABkARQnAQ",
    "https://gw.alipayobjects.com/mdn/rms_475770/afts/img/A*iRRMQIExwKMAAAAAAAAAAABkARQnAQ",
    "https://gw.alipayobjects.com/mdn/rms_475770/afts/img/A*ZIcPQZo20sAAAAAAAAAAAABkARQnAQ",
    "https://gw.alipayobjects.com/mdn/rms_475770/afts/img/A*SPYuTbHT-KgAAAAAAAAAAABkARQnAQ",
    "https://gw.alipayobjects.com/mdn/rms_475770/afts/img/A*mGUERbY77roAAAAAAAAAAABkARQnAQ",
    "https://gw.alipayobjects.com/mdn/rms_475770/afts/img/A*ilkPS7A1_JsAAAAAAAAAAABkARQnAQ"
  ],
  house: [
    "https://gw.alipayobjects.com/mdn/rms_475770/afts/img/A*1gjTQ7P2mQoAAAAAAAAAAABkARQnAQ",
    "https://gw.alipayobjects.com/mdn/rms_475770/afts/img/A*entSR7DylL0AAAAAAAAAAABkARQnAQ",
    "https://gw.alipayobjects.com/mdn/rms_475770/afts/img/A*izQBQY_vs_4AAAAAAAAAAABkARQnAQ",
    "https://gw.alipayobjects.com/mdn/rms_475770/afts/img/A*x3XnRpq1U-EAAAAAAAAAAABkARQnAQ",
    "https://gw.alipayobjects.com/mdn/rms_475770/afts/img/A*k7FsT5Gprn0AAAAAAAAAAABkARQnAQ",
    "https://gw.alipayobjects.com/mdn/rms_475770/afts/img/A*8LdBQ6ixiQAAAAAAAAAAAABkARQnAQ"
  ],
  sunnyDay: [
    "https://gw.alipayobjects.com/mdn/rms_475770/afts/img/A*4ZY8T4GpKwYAAAAAAAAAAABkARQnAQ",
    "https://gw.alipayobjects.com/mdn/rms_475770/afts/img/A*8QbJQZwS1wUAAAAAAAAAAABkARQnAQ",
    "https://gw.alipayobjects.com/mdn/rms_475770/afts/img/A*a54kSZ3LmAQAAAAAAAAAAABkARQnAQ",
    "https://gw.alipayobjects.com/mdn/rms_475770/afts/img/A*8CbfTb1yG8MAAAAAAAAAAABkARQnAQ",
    "https://gw.alipayobjects.com/mdn/rms_475770/afts/img/A*Yi4ZRZbdj8MAAAAAAAAAAABkARQnAQ",
    "https://gw.alipayobjects.com/mdn/rms_475770/afts/img/A*KddxSriLYjoAAAAAAAAAAABkARQnAQ"
  ],
  miniSampler: [
    "https://gw.alipayobjects.com/mdn/rms_475770/afts/img/A*IuyGR4bdwg4AAAAAAAAAAABkARQnAQ",
    "https://gw.alipayobjects.com/mdn/rms_475770/afts/img/A*4rv5RZ0kll4AAAAAAAAAAABkARQnAQ",
    "https://gw.alipayobjects.com/mdn/rms_475770/afts/img/A*cHitTpWoJjoAAAAAAAAAAABkARQnAQ",
    "https://gw.alipayobjects.com/mdn/rms_475770/afts/img/A*RCEbS6k5x18AAAAAAAAAAABkARQnAQ",
    "https://gw.alipayobjects.com/mdn/rms_475770/afts/img/A*IRc7R7cl4CcAAAAAAAAAAABkARQnAQ",
    "https://gw.alipayobjects.com/mdn/rms_475770/afts/img/A*y_4hRYVgzQ4AAAAAAAAAAABkARQnAQ"
  ]
};

class Oasis {
  static guiToColor(gui: number[], color: Color) {
    color.setValue(gui[0] / 255, gui[1] / 255, gui[2] / 255, color.a);
  }

  static colorToGui(color: Color = new Color(1, 1, 1)): number[] {
    const v = [];
    v[0] = color.r * 255;
    v[1] = color.g * 255;
    v[2] = color.b * 255;
    return v;
  }

  cubeTextures: Record<string, TextureCubeMap> = {};
  textures: Record<string, Texture2D> = {};

  engine: WebGLEngine = new WebGLEngine("o3-demo");
  scene: Scene = this.engine.sceneManager.activeScene;
  skyMaterial: SkyBoxMaterial = new SkyBoxMaterial(this.engine);

  // Entity
  rootEntity: Entity = this.scene.createRootEntity("root");
  cameraEntity: Entity = this.rootEntity.createChild("camera");
  gltfRootEntity: Entity = this.rootEntity.createChild("gltf");
  pointLightEntity1: Entity = this.rootEntity.createChild("point_light1");
  pointLightEntity2: Entity = this.rootEntity.createChild("point_light2");

  // Component
  camera: Camera = this.cameraEntity.addComponent(Camera);
  controler: OrbitControl = this.cameraEntity.addComponent(OrbitControl);
  pointLight1: PointLight = this.pointLightEntity1.addComponent(PointLight);
  pointLight2: PointLight = this.pointLightEntity2.addComponent(PointLight);

  // Debug
  gui = new dat.GUI();
  materialFolder = null;
  animationFolder = null;
  state = {
    // Scene
    background: false,
    // Lights
    envTexture: "miniSampler",
    envIntensity: 1,
    addLights: true,
    lightColor: Oasis.colorToGui(new Color(1, 1, 1)),
    lightIntensity: 0.8,
    // GLTF Model List
    defaultGLTF: "animatedCube",
    gltfList: {
      alphaBlendModeTest: "https://gw.alipayobjects.com/os/bmw-prod/d099b30b-59a3-42e4-99eb-b158afa8e65d.glb",
      animatedCube: "https://gw.alipayobjects.com/os/bmw-prod/8cc524dd-2481-438d-8374-3c933adea3b6.gltf"
    }
  };
  _materials: Material[] = [];

  // temporary
  _boundingBox: BoundingBox = new BoundingBox();
  _center: Vector3 = new Vector3();
  _extent: Vector3 = new Vector3();

  constructor() {
    this.initResources().then(() => {
      this.initScene();
      this.addGLTFList();
      this.addSceneGUI();
    });
  }

  initResources() {
    const names = Object.keys(envList);

    return new Promise((resolve) => {
      this.engine.resourceManager
        .load(
          names.map((name) => {
            return {
              type: AssetType.TextureCube,
              urls: envList[name]
            };
          })
        )
        .then((textures) => {
          (textures as any).forEach((texture: TextureCubeMap, index) => {
            const name = names[index];
            this.cubeTextures[name] = texture;
            if (name === this.state.envTexture) {
              this.scene.ambientLight.specularTexture = texture;
              this.skyMaterial.textureCubeMap = texture;
            }
          });
          resolve(true);
        });
    });
  }

  initScene() {
    this.engine.canvas.resizeByClientSize();
    this.controler.minDistance = 0;

    // debug sync
    if (this.state.background) {
      this.scene.background.mode = BackgroundMode.Sky;
    }
    if (!this.state.addLights) {
      this.pointLight1.enabled = false;
      this.pointLight2.enabled = false;
    }
    this.pointLight1.intensity = this.state.lightIntensity;
    this.pointLight2.intensity = this.state.lightIntensity;
    this.scene.ambientLight.specularIntensity = this.state.envIntensity;
    this.scene.background.sky.material = this.skyMaterial;
    this.scene.background.sky.mesh = PrimitiveMesh.createCuboid(this.engine, 1, 1, 1);
    this.engine.run();
  }

  addGLTFList() {
    this.loadGLTF(this.state.gltfList[this.state.defaultGLTF]);
    this.gui
      .add(this.state, "defaultGLTF", Object.keys(this.state.gltfList))
      .name("GLTF List")
      .onChange((v) => {
        this.loadGLTF(this.state.gltfList[v]);
      });
  }

  addSceneGUI() {
    const { gui } = this;
    // Display controls.
    const dispFolder = gui.addFolder("Scene");
    dispFolder.add(this.state, "background").onChange((v: boolean) => {
      if (v) {
        this.scene.background.mode = BackgroundMode.Sky;
      } else {
        this.scene.background.mode = BackgroundMode.SolidColor;
      }
    });

    // Lighting controls.
    const lightFolder = gui.addFolder("Lighting");
    lightFolder
      .add(this.state, "envTexture", ["None", ...Object.keys(this.cubeTextures)])
      .name("IBL")
      .onChange((v) => {
        this.scene.ambientLight.specularTexture = this.skyMaterial.textureCubeMap =
          v === "None" ? null : this.cubeTextures[v];
      });
    lightFolder
      .add(this.state, "envIntensity", 0, 2)
      .onChange((v) => {
        this.scene.ambientLight.specularIntensity = v;
      })
      .name("间接光强度");
    lightFolder
      .add(this.state, "addLights")
      .onChange((v) => {
        this.pointLight1.enabled = v;
        this.pointLight2.enabled = v;
      })
      .name("直接光");
    lightFolder.addColor(this.state, "lightColor").onChange((v) => {
      Oasis.guiToColor(v, this.pointLight1.color);
      Oasis.guiToColor(v, this.pointLight2.color);
    });
    lightFolder
      .add(this.state, "lightIntensity", 0, 2)
      .onChange((v) => {
        this.pointLight1.intensity = v;
        this.pointLight2.intensity = v;
      })
      .name("直接光强度");
  }

  setCenter(renderers: Renderer[]) {
    const boundingBox = this._boundingBox;
    const center = this._center;
    const extent = this._extent;

    boundingBox.min.setValue(0, 0, 0);
    boundingBox.max.setValue(0, 0, 0);

    renderers.forEach((renderer) => {
      BoundingBox.merge(renderer.bounds, boundingBox, boundingBox);
    });
    boundingBox.getExtent(extent);
    const size = extent.length();

    boundingBox.getCenter(center);
    this.controler.target.setValue(center.x, center.y, center.z);
    this.cameraEntity.transform.setPosition(center.x, center.y, size * 3);

    this.camera.farClipPlane = size * 12;
    this.controler.maxDistance = size * 10;

    this.pointLightEntity1.transform.setPosition(0, size * 3, size * 3);
    this.pointLightEntity2.transform.setPosition(0, -size * 3, -size * 3);
  }

  loadGLTF(url: string) {
    this.removeGLTF();
    this.engine.resourceManager
      .load<GLTFResource>({
        type: AssetType.Perfab,
        url
      })
      .then((asset) => {
        const { defaultSceneRoot, materials, animations } = asset;
        console.log(asset);
        this.gltfRootEntity = defaultSceneRoot;
        this.rootEntity.addChild(defaultSceneRoot);

        const meshRenderers = [];
        const skinnedMeshRenderers = [];
        defaultSceneRoot.getComponentsIncludeChildren(MeshRenderer, meshRenderers);
        defaultSceneRoot.getComponentsIncludeChildren(SkinnedMeshRenderer, skinnedMeshRenderers);

        this.setCenter(meshRenderers.concat(skinnedMeshRenderers));
        this.loadMaterialGUI(materials);
        this.loadAnimationGUI(animations);
      })
      .catch((e) => {
        console.error(e);
      });
  }

  removeGLTF() {
    this.rootEntity.removeChild(this.gltfRootEntity);
  }

  loadMaterialGUI(materials?: Material[]) {
    const { gui } = this;
    if (this.materialFolder) {
      gui.removeFolder(this.materialFolder);
      this.materialFolder = null;
    }
    if (!materials) {
      materials = this._materials;
    }
    this._materials = materials;
    if (!materials.length) return;

    const folder = (this.materialFolder = gui.addFolder("Material"));
    const folderName = {};

    materials.forEach((material) => {
      if (!(material instanceof PBRBaseMaterial) && !(material instanceof UnlitMaterial)) return;
      if (!material.name) {
        material.name = "default";
      }
      const state = {
        baseColor: Oasis.colorToGui(material.baseColor),
        emissiveColor: Oasis.colorToGui((material as PBRBaseMaterial).emissiveColor),
        specularColor: Oasis.colorToGui((material as PBRSpecularMaterial).specularColor),
        baseTexture: material.baseTexture ? "origin" : "",
        metallicRoughnessTexture: (material as PBRMaterial).metallicRoughnessTexture ? "origin" : "",
        normalTexture: (material as PBRBaseMaterial).normalTexture ? "origin" : "",
        emissiveTexture: (material as PBRBaseMaterial).emissiveTexture ? "origin" : "",
        occlusionTexture: (material as PBRBaseMaterial).occlusionTexture ? "origin" : "",
        opacityTexture: (material as PBRBaseMaterial).opacityTexture ? "origin" : "",
        specularGlossinessTexture: (material as PBRSpecularMaterial).specularGlossinessTexture ? "origin" : ""
      };

      const originTexture = {
        baseTexture: material.baseTexture,
        metallicRoughnessTexture: (material as PBRMaterial).metallicRoughnessTexture,
        normalTexture: (material as PBRBaseMaterial).normalTexture,
        emissiveTexture: (material as PBRBaseMaterial).emissiveTexture,
        occlusionTexture: (material as PBRBaseMaterial).occlusionTexture,
        opacityTexture: (material as PBRBaseMaterial).opacityTexture,
        specularGlossinessTexture: (material as PBRSpecularMaterial).specularGlossinessTexture
      };

      const f = folder.addFolder(
        folderName[material.name] ? `${material.name}_${folderName[material.name] + 1}` : material.name
      );

      folderName[material.name] = folderName[material.name] == null ? 1 : folderName[material.name] + 1;

      // metallic
      if (material instanceof PBRMaterial) {
        const mode1 = f.addFolder("金属模式");
        mode1.add(material, "metallicFactor", 0, 1).step(0.01);
        mode1.add(material, "roughnessFactor", 0, 1).step(0.01);
        mode1
          .add(state, "metallicRoughnessTexture", ["None", "origin", ...Object.keys(this.textures)])
          .onChange((v) => {
            material.metallicRoughnessTexture =
              v === "None" ? null : this.textures[v] || originTexture.metallicRoughnessTexture;
          });
        mode1.open();
      }
      // specular
      else if (material instanceof PBRSpecularMaterial) {
        const mode2 = f.addFolder("高光模式");
        mode2.add(material, "glossinessFactor", 0, 1).step(0.01);
        mode2.addColor(state, "specularColor").onChange((v) => {
          Oasis.guiToColor(v, material.specularColor);
        });
        mode2
          .add(state, "specularGlossinessTexture", ["None", "origin", ...Object.keys(this.textures)])
          .onChange((v) => {
            material.specularGlossinessTexture =
              v === "None" ? null : this.textures[v] || originTexture.specularGlossinessTexture;
          });
        mode2.open();
      } else if (material instanceof UnlitMaterial) {
        f.add(state, "baseTexture", ["None", "origin", ...Object.keys(this.textures)]).onChange((v) => {
          material.baseTexture = v === "None" ? null : this.textures[v] || originTexture.baseTexture;
        });

        f.addColor(state, "baseColor").onChange((v) => {
          Oasis.guiToColor(v, material.baseColor);
        });
      }

      // common
      if (!(material instanceof UnlitMaterial)) {
        const common = f.addFolder("通用");

        common.add(material, "envMapIntensity", 0, 2).step(0.01);
        common
          .add(material, "opacity", 0, 1)
          .step(0.01)
          .onChange((v) => (state.baseColor[3] = v));
        common.add(material, "isTransparent");
        common.add(material, "alphaCutoff", 0, 1).step(0.01);
        common.add(material, "getOpacityFromRGB");

        common
          .addColor(state, "baseColor")
          .onChange((v) => {
            Oasis.guiToColor(v, material.baseColor);
          })
          .listen();
        common.addColor(state, "emissiveColor").onChange((v) => {
          Oasis.guiToColor(v, material.emissiveColor);
        });
        common.add(state, "baseTexture", ["None", "origin", ...Object.keys(this.textures)]).onChange((v) => {
          material.baseTexture = v === "None" ? null : this.textures[v] || originTexture.baseTexture;
        });
        common.add(state, "normalTexture", ["None", "origin", ...Object.keys(this.textures)]).onChange((v) => {
          material.normalTexture = v === "None" ? null : this.textures[v] || originTexture.normalTexture;
        });
        common.add(state, "emissiveTexture", ["None", "origin", ...Object.keys(this.textures)]).onChange((v) => {
          material.emissiveTexture = v === "None" ? null : this.textures[v] || originTexture.emissiveTexture;
        });
        common.add(state, "occlusionTexture", ["None", "origin", ...Object.keys(this.textures)]).onChange((v) => {
          material.occlusionTexture = v === "None" ? null : this.textures[v] || originTexture.occlusionTexture;
        });
        common.add(state, "opacityTexture", ["None", "origin", ...Object.keys(this.textures)]).onChange((v) => {
          material.opacityTexture = v === "None" ? null : this.textures[v] || originTexture.opacityTexture;
        });
        common.open();
      }
    });
  }

  loadAnimationGUI(animations: AnimationClip[]) {
    if (this.animationFolder) {
      this.gui.removeFolder(this.animationFolder);
      this.animationFolder = null;
    }

    if (animations?.length) {
      this.animationFolder = this.gui.addFolder("Animation");
      this.animationFolder.open();
      const animator = this.gltfRootEntity.getComponent(Animation);
      animator.playAnimationClip(animations[0].name);
      const state = {
        animation: animations[0].name
      };
      this.animationFolder
        .add(state, "animation", ["None", ...animations.map((animation) => animation.name)])
        .onChange((name) => {
          if (name === "None") {
            animator.stop(true);
          } else {
            animator.playAnimationClip(name);
          }
        });
    }
  }
}

new Oasis();
