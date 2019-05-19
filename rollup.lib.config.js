import resolve from "rollup-plugin-node-resolve";
import typescript from "rollup-plugin-typescript2";
import babel from "rollup-plugin-babel";
import pkg from "./package.json";

export default [
  {
    input: "src/index.ts",
    plugins: [
      resolve({
        jsnext: true,
        browser: false,
        modulesOnly: true
      }),
      typescript(),
      babel({
        exclude: "node_modules/**"
      })
    ],
    output: [{ file: pkg.module, format: "es" }]
  }
];
