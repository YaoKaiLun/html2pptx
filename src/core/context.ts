import { Bounds } from '../htmlParser/css/layout/bounds';
import { Logger } from './logger';
import { Cache, ResourceOptions } from './cache-storage';

export interface IContextOptions extends ResourceOptions {
  logging?: boolean;
  cache?: Cache;
};

export class Context {
  private readonly instanceName = `#${Context.instanceCount++}`;
  readonly logger: Logger;
  readonly cache: Cache;

  private static instanceCount = 1;

  constructor(options: IContextOptions, public windowBounds: Bounds) {
    this.logger = new Logger({id: this.instanceName, enabled: options.logging || false});
    this.cache = options.cache ?? new Cache(this, options);
  }
}
