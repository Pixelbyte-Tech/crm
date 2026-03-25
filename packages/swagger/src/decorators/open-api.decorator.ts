import { set } from 'lodash';
import { Type, applyDecorators } from '@nestjs/common';
import { SchemaObject, ReferenceObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import {
  ApiBody,
  ApiTags,
  ApiOkResponse,
  getSchemaPath,
  ApiBodyOptions,
  ApiExtraModels,
  ApiResponseCommonMetadata,
} from '@nestjs/swagger';

export interface SwaggerResponseOptions extends ApiResponseCommonMetadata {
  isPaginated?: boolean;
  body?: ApiBodyOptions;
  tags?: string[];
  schema?: SchemaObject & Partial<ReferenceObject>;
}

export function OpenApi(arg?: SwaggerResponseOptions) {
  const decorators: [ClassDecorator | MethodDecorator | PropertyDecorator] = [ApiOkResponse(apiResponse(arg))];

  if (arg && arg.type) {
    decorators.push(ApiExtraModels(arg.type as () => Type<unknown>));
  }

  if (arg && arg.tags) {
    decorators.push(ApiTags(...arg.tags));
  }

  if (arg && arg.body) {
    decorators.push(ApiBody(arg.body));
  }

  return applyDecorators(...decorators);
}

function apiResponse(options?: SwaggerResponseOptions) {
  if (options?.schema) {
    return {
      description: options.description,
      schema: options.schema,
    };
  }

  const response = {
    description: options?.description,
    schema: {
      type: 'object',
      required: ['data'],
      properties: { data: {} },
    },
  };

  if (options?.isPaginated) {
    response.schema.required = response.schema.required.concat(['page', 'limit', 'total']);

    set(response.schema.properties, 'page', {
      type: 'number',
    });
    set(response.schema.properties, 'limit', {
      type: 'number',
    });
    set(response.schema.properties, 'total', {
      type: 'number',
    });
  }

  let type = getSchemaPath(options?.type as () => void);

  if (type.endsWith('/String')) {
    type = 'string';
  }
  if (type.endsWith('/Number')) {
    type = 'number';
  }
  if (type.endsWith('/Boolean')) {
    type = 'boolean';
  }

  if (options && (options.isArray || options.isPaginated)) {
    response.schema.properties['data'] = {
      type: 'array',
      items: type.includes('/') ? { $ref: type } : { type },
    };
  } else {
    response.schema.properties['data'] = type.includes('/') ? { $ref: type } : { type };
  }

  return response;
}
