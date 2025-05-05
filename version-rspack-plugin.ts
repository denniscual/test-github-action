import path from "node:path";
import fs from "node:fs";
import type { Compiler } from "@rspack/core";

const PLUGIN_NAME = "VersionRspackPlugin";

export class VersionRspackPlugin {
  private versionFileName: string;
  private buildDateElementId: string;
  private buildNumberElementId: string;

  constructor() {
    this.versionFileName = "version.json";
    this.buildDateElementId = "cp_build_date";
    this.buildNumberElementId = "cp_build_number";
  }

  apply(compiler: Compiler) {
    const buildDate = new Date().toISOString();
    const buildNumber = process.env.REACT_APP__BUILD_NUMBER;

    // Write version.json file
    compiler.hooks.emit.tapAsync(PLUGIN_NAME, (compilation, callback) => {
      const buildDateStaleThreshold = process.env
        .REACT_APP_BUILD_DATE_STALE_THRESHOLD
        ? parseInt(process.env.REACT_APP_BUILD_DATE_STALE_THRESHOLD, 10)
        : 1000 * 60 * 60 * 24 * 14; // Default to 2 weeks.

      const versionInfo = {
        buildDate,
        buildNumber,
        /**
         * The minimum time difference (in milliseconds) between the current time and
         * the last update check that must have passed to trigger a new update check.
         */
        buildDateStaleThreshold,
      };

      const outputPath = path.resolve(
        __dirname,
        compilation.options.output.path!,
        this.versionFileName,
      );

      console.log("Generating version.json file...");

      fs.writeFile(outputPath, JSON.stringify(versionInfo, null, 2), (err) => {
        if (err) {
          console.log("Error", err);
          throw new Error(
            "VersionRspackPlugin: Encounter an error while writing version.json file.",
          );
        }

        console.log(
          "Version info is created:",
          JSON.stringify(versionInfo, null, 2),
        );

        callback();
      });
    });

    // Embed build date into html
    compiler.hooks.emit.tapAsync(
      PLUGIN_NAME,
      (compilation: any, callback: () => void) => {
        console.log("Embedding version data into html...");

        const htmlFile = Object.keys(compilation.assets).find((file) =>
          file.endsWith("index.html"),
        );

        if (!htmlFile) {
          const error = new Error(
            `${PLUGIN_NAME}: No HTML file found in compilation assets.`,
          );
          compilation.errors.push(error);
          return callback();
        }

        const htmlContent = compilation.assets[htmlFile].source();

        const updatedHtmlContent = htmlContent.replace(
          "</body>",
          `<div hidden id="${this.buildDateElementId}">${buildDate}</div>${
            buildNumber
              ? `<div hidden id="${this.buildNumberElementId}">${buildNumber}</div>`
              : ""
          }</body>`,
        );

        // Update the asset with the modified content
        compilation.assets[htmlFile] = {
          source: () => updatedHtmlContent,
          size: () => updatedHtmlContent.length,
        };

        console.log("version data got embedded successfully.");

        callback();
      },
    );
  }
}
