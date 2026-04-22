declare module 'node-cron' {
  export function schedule(expr: string, fn: () => void | Promise<void>, options?: any): { destroy: () => void };
  const _default: { schedule: typeof schedule };
  export default _default;
}
