import cac from "cac";

import { version } from "../package.json";
import { build } from "./prev-build";
import { dev } from "./prev-dev";
import { lint } from "./prev-lint";
import { start } from "./prev-start";
import { info } from "./prev-info";

const cli = cac("prev");

cli
  .command("dev [dir]", "Start the application in development mode with hot reloading")
  .option("-p, --port <number>", "Specify a port number to start the dev server")
  .option("--host [string]", "Specify which IP addresses the server should listen on")
  .option("-c, --config <file>", "[string] use specified config file")
  .usage(
    "dev [dir]\n\n  [dir] represents the directory of the application. By default, the current directory will be used."
  )
  .action(dev);

cli
  .command("build [dir]", "Build the application for production deployment")
  .option("-c, --config <file>", "[string] use specified config file")
  .usage(
    "build [dir]\n\n  [dir] represents the directory of the application. By default, the current directory will be used."
  )
  .action(build);

cli
  .command("start [dir]", "Start the application in production mode after `prev build`.")
  .usage(
    "start [dir]\n\n  [dir] represents the directory of the application. By default, the current directory will be used."
  )
  .option("-p, --port <number>", "Specify a port number to start the dev server")
  .option("--host [string]", "Specify which IP addresses the server should listen on")
  .action(start);

cli
  .command("lint [dir]", "Run eslint check on every file.")
  .usage(
    "lint [dir]\n\n  [dir] represents the directory of the application. By default, the current directory will be used."
  )
  .option("--fix", "Automatically fix problems", {
    default: false,
  })
  .action(lint);

cli.command("info", "Print env info like system info and versions.").action(info);

cli.help();
cli.version(version);
cli.parse();
