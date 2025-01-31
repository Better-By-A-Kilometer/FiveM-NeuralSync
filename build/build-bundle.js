const esbuild = require("esbuild");

const IS_WATCH_MODE = process.env.IS_WATCH_MODE;

const TARGET_ENTRIES = [
    {
        target: "node16",
        entryPoints: ["server/ai_module.ts"],
        platform: "node",
        outfile: "./resource/Kilo_AIPeds/ai_module.js",
    },
    {
        target: "es2020",
        entryPoints: ["client/visualizer.ts"],
        outfile: "./resource/Kilo_AIPeds/visualizer.js",
    },
    {
        target: "node16",
        entryPoints: ["modules/SmartPeds/server/server.ts"],
        outfile: "./resource/Kilo_AIPeds/SmartPeds/server.js"
    },
    {
        target: "es2020",
        entryPoints: ["modules/SmartPeds/client/client.ts"],
        outfile: "./resource/Kilo_AIPeds/SmartPeds/client.js"
    }
];

const buildBundle = async () => {
    try {
        const baseOptions = {
            logLevel: "info",
            bundle: true,
            charset: "utf8",
            minifyWhitespace: true,
            absWorkingDir: process.cwd(),
        };

        for (const targetOpts of TARGET_ENTRIES) {
            const mergedOpts = { ...baseOptions, ...targetOpts };

            if (IS_WATCH_MODE) {
                mergedOpts.watch = {
                    onRebuild(error) {
                        if (error)
                            console.error(
                                `[ESBuild Watch] (${targetOpts.entryPoints[0]}) Failed to rebuild bundle`
                            );
                        else
                            console.log(
                                `[ESBuild Watch] (${targetOpts.entryPoints[0]}) Sucessfully rebuilt bundle`
                            );
                    },
                };
            }

            const { errors } = await esbuild.build(mergedOpts);

            if (errors.length) {
                console.error(`[ESBuild] Bundle failed with ${errors.length} errors`);
                process.exit(1);
            }
        }
    } catch (e) {
        console.log("[ESBuild] Build failed with error");
        console.error(e);
        process.exit(1);
    }
};

buildBundle().catch(() => process.exit(1));