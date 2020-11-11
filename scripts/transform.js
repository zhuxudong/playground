const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const generator = require("@babel/generator").default;
const fs = require("fs-extra");
const types = require("@babel/types");
const path = require("path");

const miniModules = [
  "oasis-engine",
  "@alipay/o3-adapter-miniprogram",
  "@alipay/o3-tween",
  "@oasis-engine/controls",
  "@oasis-engine/framebuffer-picker",
  "@alipay/post-processing",
  "@alipay/o3-decal",
  "@alipay/o3-renderer-oit",
  "@alipay/o3-screenshot",
  "@alipay/o3-fsm",
  "@alipay/o3-draco",
  "@alipay/o3-hud"
];

const coreModules = [
  "@oasis-engine/math",
  "@oasis-engine/rhi-webgl",
  "@oasis-engine/loader",
  "@oasis-engine/math",
  "@oasis-engine/core"
];

const template = fs.readFileSync(path.join(__dirname, "./template.txt"), { encoding: "utf-8" });

const templateAst = parse(template, {
  sourceType: "module"
});

async function transformFileToAsync(filepath, target) {
  const { code } = await transformFileAsync(filepath);
  await fs.writeFile(target, code, { encoding: "utf-8" });
  console.log(`write to ${target} success`);
}

async function transformFileAsync(filepath) {
  const code = await fs.readFile(filepath, { encoding: "utf-8" });
  try {
    return transformCode(code);
  } catch (e) {
    console.log(`${filepath} transform error`);
    console.log(e.message);
    return "";
  }
}

function transformCode(code) {
  const codeAst = parse(code, {
    sourceType: "module"
  });

  return astToCode(codeAst, templateAst);
}

function astToCode(codeAst, templateAst) {
  traverse(codeAst, {
    ImportDeclaration(path) {
      const node = path.node;
      let value = node.source.value;
      if (coreModules.indexOf(value) > -1) {
        value = "oasis-engine";
      }
      if (miniModules.indexOf(value) > -1) {
        node.source.value = value + "/dist/miniprogram";
      } else if (value === "dat.gui") {
        node.source.value = "/pages/playground/common/dat-mock";
      } else if (value === "@oasis-engine/stats") {
        path.remove();
      }
    },
    NewExpression(path) {
      const node = path.node;
      if (node.callee.name === "WebGLEngine") {
        node.arguments[0] = types.identifier("canvas");
      }
    },
    Identifier(path) {
      const name = path.node.name;
      const adapterArray = [
        "window",
        "atob",
        "devicePixelRatio",
        "document",
        "Element",
        "Event",
        "EventTarget",
        "HTMLCanvasElement",
        "HTMLElement",
        "HTMLMediaElement",
        "HTMLVideoElement",
        "Image",
        "navigator",
        "Node",
        "screen",
        "XMLHttpRequest",
        "performance"
      ];
      const replaces = adapterArray.reduce((pre, curr) => {
        pre[curr] = `miniprogram.${curr}`;
        return pre;
      }, {});
      if (path.parent && path.parent.object && path.parent.object.name === name && name in replaces) {
        path.node.name = replaces[name];
      }
    }
  });

  const importDeclaration = codeAst.program.body.filter((node) => node.type === "ImportDeclaration");

  const commandExpression = codeAst.program.body.filter((node) => node.type !== "ImportDeclaration");

  templateAst.program.body.unshift(...importDeclaration);

  traverse(templateAst, {
    BlockStatement(path) {
      if (
        path.parent &&
        path.parent.params &&
        path.parent.params[0] &&
        path.parent.params[0].name === "canvas" &&
        path.parentPath &&
        path.parentPath.container &&
        path.parentPath.container.key &&
        path.parentPath.container.key.name === "success"
      ) {
        path.node.body.push(...commandExpression);
      }
    }
  });

  return generator(templateAst);
}

module.exports = {
  transformFileToAsync,
  astToCode
};
