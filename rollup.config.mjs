import path from "path";
import fs from "fs";
import typescript from "rollup-plugin-typescript2";
import dts from "rollup-plugin-dts";
import pkg from "./package.json" with { type: "json" };

const __dirname = path.resolve();
const LICENSE = fs.readFileSync("LICENSE", { encoding: "utf-8" });
const banner = [
  "/*!",
  ...LICENSE.split("\n").map(o => ` * ${o}`),
  " */",
  "",
].join("\n");
const input = "src/index.ts";
const external = Object.keys(pkg.dependencies || {});

export default [
  {
    input,
    plugins: [
      typescript({
        check: true,
        clean: true,
        tsconfigOverride: {
          compilerOptions: {
            module: "ES2015",
            removeComments: true,
          }
        }
      }),
    ],
    external: [...external],
    output: [
      {
        banner,
        file: pkg.main,
        format: "cjs",
      },
      {
        banner,
        file: pkg.module,
        format: "es",
      },
    ],
  },
  {
    input,
    external: [...external],
    plugins: [
      dts({
        tsconfig: path.resolve(__dirname, "./tsconfig.json"),
        compilerOptions: {
          stripInternal: true,
        }
      })
    ],
    output: [
      {
        banner,
        file: pkg.types,
      }
    ]
  },
];