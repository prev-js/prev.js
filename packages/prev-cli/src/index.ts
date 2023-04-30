import cac from "cac";

import { version } from "../package.json";
import { build } from "./prev-build";
import { dev } from "./prev-dev";
import { lint } from "./prev-lint";
import { start } from "./prev-start";

const cli = cac();

cli.command("dev").action(dev);
cli.command("lint").action(lint);
cli.command("build").action(build);
cli.command("start").action(start);

cli.help();
cli.version(version);
cli.parse();
