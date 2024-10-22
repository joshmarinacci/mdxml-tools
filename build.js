import { build } from "esbuild";
import pkg from "npm-dts";
const { Generator } = pkg;

async function go() {
    const sharedConfig = {
        entryPoints: ["src/index.ts"],
        bundle: true,
        minify: false,
    };

    await new Generator({
        entry: "src/index.ts",
        output: "build/index.d.ts",
    }).generate();

    // await build({
    //     ...sharedConfig,
    //     platform: "node",
    //     outfile: "build/index.cjs",
    //     external:["rtds-core","react","react-dom"],
    // });

    await build({
        ...sharedConfig,
        platform: "neutral",
        format: "esm",
        outfile: "build/index.esm.js",
        external:["rtds-core","react","react-dom","@rgrove/parse-xml"],
    });
}

go()
    .then(() => console.log("done"))
    .catch((e) => console.log(e));
