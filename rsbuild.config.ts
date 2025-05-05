import { defineConfig, loadEnv } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { VersionRspackPlugin } from "./version-rspack-plugin";

const { publicVars } = loadEnv({ prefixes: ["REACT_APP_"] });

export default defineConfig({
	source: {
		define: publicVars,
	},
	plugins: [pluginReact()],
	tools: {
		rspack(_, { appendPlugins }) {
			appendPlugins(new VersionRspackPlugin());
		},
	},
});
