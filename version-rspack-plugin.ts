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
    const forceUpdateBuildCount = process.env.FORCE_UPDATE_BUILD_COUNT;

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
        forceUpdateBuildCount,
      };

      console.log("Logging version...");

      console.log({ versionInfo });

      callback();
    });
  }
}
