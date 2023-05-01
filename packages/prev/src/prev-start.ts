import { preview } from "vite";

interface StartCommandOption {
  port: number;
  host: string;
}

export async function start(root = process.cwd(), options?: StartCommandOption) {
  const previewServer = await preview({
    configFile: false,
    mode: "production",
    root,
    preview: {
      port: options?.port,
      host: options?.host,
      open: true,
    },
  });

  previewServer.printUrls();
}
