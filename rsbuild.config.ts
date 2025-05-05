import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { VersionRspackPlugin } from "./version-rspack-plugin";

export default defineConfig({
	plugins: [pluginReact()],
	tools: {
		rspack(_, { appendPlugins }) {
			appendPlugins(new VersionRspackPlugin());
		},
	},
});
