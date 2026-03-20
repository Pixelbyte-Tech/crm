import { Type } from '@nestjs/common';

export type Option<T extends Type<any> = any> = {
  in: 'query' | 'body' | 'params' | 'headers';
  use: string;
  findBy: keyof InstanceType<T>;
};
