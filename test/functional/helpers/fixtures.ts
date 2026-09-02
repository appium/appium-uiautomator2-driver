import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {node} from 'appium/support.js';

const MODULE_NAME = 'appium-uiautomator2-driver';

let assetsDir: string | undefined;

/**
 * Resolves the `test/functional/assets` fixtures directory of this module on disk,
 * regardless of whether the caller runs from source or from the compiled `build/` output.
 */
export function getAssetsDir(): string {
  if (!assetsDir) {
    const filename = fileURLToPath(import.meta.url);
    const moduleRoot = node.getModuleRootSync(MODULE_NAME, filename);
    if (!moduleRoot) {
      throw new Error(`Cannot find the root folder of the ${MODULE_NAME} Node.js module`);
    }
    assetsDir = path.resolve(moduleRoot, 'test', 'functional', 'assets');
  }
  return assetsDir;
}

/** Resolves a path to a fixture file under `test/functional/assets`. */
export function getAssetPath(...segments: string[]): string {
  return path.resolve(getAssetsDir(), ...segments);
}
