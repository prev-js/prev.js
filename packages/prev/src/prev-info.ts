import os from "node:os";
import { getBinaryVersion, getPackageVersion } from "./utils";

export function info() {
  console.log(`
    Operating System:
      platform: ${os.platform()}
      arch: ${os.arch()}
      version: ${os.version()}
    Binaries:
      node: ${process.versions.node}
      npm: ${getBinaryVersion("npm")}
      yarn: ${getBinaryVersion("yarn")}
      pnpm: ${getBinaryVersion("pnpm")}
    Packages:
      previous.js: ${getPackageVersion("previous.js")}
      react: ${getPackageVersion("react")}
      react-dom: ${getPackageVersion("react-dom")}
`);
}
