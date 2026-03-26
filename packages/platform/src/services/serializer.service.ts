import { Injectable } from '@nestjs/common';

@Injectable()
export class Serializer {
  serialize<T>(value: T): string {
    return JSON.stringify(value, this.#replacer);
  }

  unSerialize<T = any>(value: string | null): T | null {
    if (null === value) {
      return null;
    }

    try {
      return JSON.parse(value, this.#reviver);
    } catch {
      return null;
    }
  }

  #replacer(_: any, value: any) {
    if (value instanceof Map) {
      return {
        dataType: 'Map',
        value: Array.from(value.entries()), // or with spread: value: [...value]
      };
    } else {
      return value;
    }
  }

  #reviver(_: any, value: any) {
    if (typeof value === 'object' && value !== null) {
      if (value.dataType === 'Map') {
        return new Map(value.value);
      }
    }
    return value;
  }
}
