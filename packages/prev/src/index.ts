export interface Options {
  /**
   * Code splitting every page component
   * Default is `true`
   */
  splitting?: boolean;
}

export const defineConfig = (options: Options) => options;
