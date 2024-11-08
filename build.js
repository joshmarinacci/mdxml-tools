import { build } from "esbuild";
import pkg from "npm-dts";
const { Generator } = pkg;

async function go() {
    const sharedConfig = {
        entryPoints: ["src/cli.ts"],
        bundle: false,
        minify: false,
    };

    // await new Generator({
    //     entry: "src/cli.ts",
    //     output: "build/cli.d.ts",
    // }).generate();
    // await new Generator({
    //     entry: "src/render.ts",
    //     output: "build/render.d.ts",
    // }).generate();

    // await build({
    //     ...sharedConfig,
    //     platform: "node",
    //     outfile: "build/index.cjs",
    //     external:["rtds-core","react","react-dom"],
    // });

    await build({
        // ...sharedConfig,
        entryPoints: ["src/cli.ts","src/render.ts","src/docset.ts","src/util.ts",'src/markdown.ts'],
        platform: "node",
        format: "esm",
        outdir:"build",
        // outfile: "build/cli.esm.js",
        // external:["rtds-core","react","react-dom","@rgrove/parse-xml","node:path"],
    });
}

go()
    .then(() => console.log("done"))
    .catch((e) => console.log(e));
