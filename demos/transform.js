import * as Babel from "@babel/standalone";

/**
 * umd
 * [key:npm]:window[***]
 */
const modules = {
  "oasis-engine": "o3",
  "@oasis-engine/controls": "o3Controls",
  "dat.gui": "dat",
  "@oasis-engine/framebuffer-picker": "o3FramebufferPicker"
};

/** String.replace(reg,to) */
const replace = [
  {
    reg: /import\s+({[\s\S]*?})\s+from\s+['"](.*)['"]/g,
    to: function (match, $1, $2) {
      return `const ${$1} = window["${modules[$2]}"]`;
    }
  },
  {
    reg: /import\s+\*\s+as\s+(\b.*\b)\s+from\s+['"](.*)['"]/g,
    to: function (match, $1, $2) {
      return `const ${$1} = window["${modules[$2]}"]`;
    }
  }
];

export default function transform(code) {
  replace.forEach(({ reg, to }) => {
    code = code.replace(reg, to);
  });
  return Babel.transform(code, {
    presets: ["es2016"],
    plugins: ["transform-typescript"]
  }).code;
}
