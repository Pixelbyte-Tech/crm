import { Type } from '@nestjs/common';

export type Option<T extends Type<any> = any> = {
  /** The part of the request to search in */
  in: 'query' | 'body' | 'params' | 'headers';
  /** The key to search for in the request to use in order to find an identifier */
  use: string;
  /** The entity property to search in using the identifier as a value */
  findBy: keyof InstanceType<T>;
};
