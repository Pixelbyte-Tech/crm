import { isArray, isString } from 'class-validator';

import { TransformFnParams } from 'class-transformer/types/interfaces';

/**
 *
 * @param params The transform params, including the value to be transformed
 * @returns
 */
export const toUpperCase = (params: TransformFnParams) => {
  if (params.value && isString(params.value)) {
    params.value = params.value.toUpperCase();
  }

  if (params.value && isArray(params.value)) {
    params.value = params.value.map((v) => v.toUpperCase());
  }

  return params.value;
};
