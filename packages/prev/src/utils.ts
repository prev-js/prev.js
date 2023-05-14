import fs from "node:fs";
import path from "node:path";
import { bundleRequire } from "bundle-require";
import JoyCon from "joycon";
import strip from "strip-json-comments";
import { defineConfig } from ".";

function jsoncParse(data: string) {
  try {
    return new Function("return " + strip(data).trim())();
  } catch {
    return {};
  }
}

async function loadJson(filepath: string) {
  try {
    return jsoncParse(await fs.promises.readFile(filepath, "utf8"));
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Failed to parse ${path.relative(process.cwd(), filepath)}: ${error.message}`
      );
    } else {
      throw error;
    }
  }
}

const jsonLoader = {
  test: /\.json$/,
  load(filepath: string) {
    return loadJson(filepath);
  },
};

const joycon = new JoyCon();
joycon.addLoader(jsonLoader);

export async function loadConfig(
  cwd: string,
  configFile?: string
): Promise<{ path?: string; data?: ReturnType<typeof defineConfig> }> {
  const configJoycon = new JoyCon();
  const packageKey = "prev";
  const configPath = await configJoycon.resolve({
    files: configFile
      ? [configFile]
      : [
          "prev.config.ts",
          "prev.config.js",
          "prev.config.cjs",
          "prev.config.mjs",
          "prev.config.json",
          "package.json",
        ],
    cwd,
    stopDir: path.parse(cwd).root,
    packageKey,
  });

  if (configPath) {
    if (configPath.endsWith(".json")) {
      let data = await loadJson(configPath);
      if (configPath.endsWith("package.json")) {
        data = data[packageKey];
      }
      if (data) {
        return { path: configPath, data };
      }
      return {};
    }

    const config = await bundleRequire({
      filepath: configPath,
    });

    return {
      path: configPath,
      data: config.mod?.[packageKey] ?? config.mod.default ?? config.mod,
    };
  }

  return {};
}
