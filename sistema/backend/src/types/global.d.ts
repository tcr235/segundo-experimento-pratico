declare module "node-cron";

declare module "@cucumber/cucumber" {
  interface World {
    lastResponse?: any;
    created?: Record<string, any>;
  }
}
