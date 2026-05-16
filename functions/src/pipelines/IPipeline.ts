export interface IPipeline {
  readonly name: string;
  run(): Promise<unknown>;
}
