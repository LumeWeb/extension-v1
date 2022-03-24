declare global {
  export interface Window {
    lume: {
      dns: {
        resolve: (
          input: string,
          params: { [key: string]: any },
          force: boolean
        ) => Promise<string | boolean>;
      };
    };
  }
}
export {};
