import fs from "node:fs";
import os from "node:os";
import childProcess from "node:child_process";

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
      prev.js: ${getPackageVersion("prev.js")}
      react: ${getPackageVersion("react")}
      react-dom: ${getPackageVersion("react-dom")}
`);
}

function getBinaryVersion(binaryName: string) {
  try {
    return childProcess.execFileSync(binaryName, ["--version"]).toString().trim();
  } catch {
    return "N/A";
  }
}

function getPackageVersion(packageName: string) {
  const a = getListedPackageVersion(packageName);
  const b = getInstalledPackageVersion(packageName);

  if (a === b) {
    return a;
  } else {
    return `${a} => ${b}`;
  }
}

function getListedPackageVersion(packageName: string) {
  const packageJson = requireJson("package.json");

  return (
    packageJson?.dependencies?.[packageName] ?? packageJson?.devDependencies?.[packageName] ?? "N/A"
  );
}

function getInstalledPackageVersion(packageName: string) {
  try {
    return require(`${packageName}/package.json`).version;
  } catch {
    return "N/A";
  }
}

function requireJson(filePath: string) {
  const file = fs.readFileSync(filePath, { encoding: "utf-8" });
  return file ? JSON.parse(file) : null;
}
