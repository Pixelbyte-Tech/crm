import { writeFile, readFileSync } from 'fs';

import { Method, SwaggerDoc, KrakendSchema, KrakendEndpoint, KrakendServiceArg } from './types';

/**
 * Produces an endpoint entry for the KrakenD config
 * @param method GET, POST, etc...
 * @param endpointPath the path for the endpoint
 * @param serviceName the name of the microservice
 * @param externalPath the external path
 */
function toEndpoint(method: Method, endpointPath: string, serviceName: string, externalPath?: string): KrakendEndpoint {
  let endpoint = externalPath ?? endpointPath;
  if (endpointPath.includes('api/health')) {
    endpoint = endpoint.replace('api/', `api/${serviceName}/`);
  }

  /** see: https://www.krakend.io/docs/endpoints/overview/ */
  return {
    backend: [
      {
        method,
        url_pattern: endpointPath,
        host: [`http://${serviceName}:3000`],
      },
    ],
    method,
    endpoint,
    output_encoding: 'no-op',
  };
}

/**
 * Read existing endpoints
 * @param path the service path
 */
function readExistingEndpoints(path: string): KrakendSchema {
  try {
    const currentEndpoints = readFileSync(path);
    return JSON.parse(currentEndpoints.toString('utf-8')) || {};
  } catch {
    console.log('No existing endpoints found, creating new file...');
    return {
      $schema: 'https://www.krakend.io/schema/v3.json',
      version: 3,
      endpoints: [],
    };
  }
}

/**
 * Map method to a color
 * @param method GET, POST, etc...
 * @returns matching color
 */
function colorMethod(method: Method): string {
  switch (method) {
    case 'GET':
      return '\x1b[32m'; // Green for GET
    case 'OPTIONS':
      return '\x1b[35m'; // Magenta for OPTIONS
    case 'POST':
      return '\x1b[33m'; // Yellow for POST
    case 'PATCH':
      return '\x1b[34m'; // Blue for PATCH
    case 'PUT':
      return '\x1b[36m'; // Cyan for PUT
    case 'DELETE':
      return '\x1b[31m'; // Red for DELETE
    default:
      return '\x1b[0m'; // Reset color to default
  }
}

/**
 * Log endpoint mapping to stdout
 * @param endpointInfo {KrakendEndpoint} the endpoint information
 */
function logEndpoint(endpointInfo: KrakendEndpoint): void {
  const { endpoint, method, backend } = endpointInfo;

  const colorizedMethod = colorMethod(method);
  const logMessage = `${colorizedMethod}[${method}] ${endpoint} -> ${backend[0].method} ${backend[0].url_pattern}\x1b[0m Mapped To Gateway`; // Reset color

  console.log(logMessage);
}

/**
 * Handle error while writing file
 * @param err The error thrown
 */
function handleWriteFileError(err: unknown): void {
  if (err) {
    throw new Error(`Unable to map your swagger endpoints to KrakenD service: ${err}`);
  }
}

/**
 * Map your local service to the Krakend gateway
 * @param param0 {KrakendServiceArg} the service arguments
 */
async function toKrakendService({
  serviceName,
  serviceUrl,
  serviceDirectory = './apps/gateway/config/services',
}: KrakendServiceArg): Promise<void> {
  const swagger: SwaggerDoc = await fetch(`${serviceUrl}/docs-json`).then((res) => res.json());

  const filePath = `${serviceDirectory}/${serviceName.replace(/-/, '_')}.json`;
  const { endpoints: currentEndpoints, ...schema } = readExistingEndpoints(filePath);

  const endpoints = Object.entries(swagger.paths).reduce<KrakendEndpoint[]>((acc, [url, currValue]) => {
    const { get, post, patch, put, delete: del } = currValue;

    const localPath = currValue.localPath ?? url;
    const externalPath = currValue.externalPath ?? url;

    const endpoints: KrakendEndpoint[] = [];
    if (get && !get.tags?.includes('hidden')) {
      endpoints.push(toEndpoint('GET', localPath, serviceName, externalPath));
    }

    if (post && !post.tags?.includes('hidden')) {
      endpoints.push(toEndpoint('POST', localPath, serviceName, externalPath));
    }

    if (patch && !patch.tags?.includes('hidden')) {
      endpoints.push(toEndpoint('PATCH', localPath, serviceName, externalPath));
    }

    if (put && !put.tags?.includes('hidden')) {
      endpoints.push(toEndpoint('PUT', localPath, serviceName, externalPath));
    }

    if (del && !del.tags?.includes('hidden')) {
      endpoints.push(toEndpoint('DELETE', localPath, serviceName, externalPath));
    }

    const uniqueEndpoints = endpoints.filter(
      (e) =>
        !currentEndpoints.find(
          (c) => c.backend[0].method === e.backend[0].method && c.backend[0].url_pattern === e.backend[0].url_pattern,
        ),
    );

    return [...uniqueEndpoints, ...acc];
  }, []);

  // Add the swagger endpoints to the current endpoints (if missing)
  if (!currentEndpoints.find((e) => `/${serviceName}/docs` === e.endpoint)) {
    endpoints.unshift({
      backend: [
        {
          method: 'GET',
          url_pattern: '/docs',
          host: [`http://${serviceName}:3000`],
        },
      ],
      method: 'GET',
      endpoint: `/${serviceName}/docs`,
      output_encoding: 'no-op',
    });

    endpoints.unshift({
      backend: [
        {
          method: 'GET',
          url_pattern: '/docs/{any}',
          host: [`http://${serviceName}:3000`],
        },
      ],
      method: 'GET',
      endpoint: `/${serviceName}/docs/{any}`,
      output_encoding: 'no-op',
    });
  }

  if (!currentEndpoints.find((e) => `/${serviceName}/docs-json` === e.endpoint)) {
    endpoints.unshift({
      backend: [
        {
          method: 'GET',
          url_pattern: '/docs-json',
          host: [`http://${serviceName}:3000`],
        },
      ],
      method: 'GET',
      endpoint: `/${serviceName}/docs-json`,
    });
  }

  endpoints.forEach((e) => logEndpoint(e));

  if (endpoints?.length === 0) {
    console.log(
      `No new endpoints to be mapped. If you added any, check if they exist in the swagger docs or add them manually to your ${filePath}.json file inside the gateway `,
    );
  }

  const final = [...endpoints, ...currentEndpoints];
  final.forEach((e) => {
    if (e.input_headers) {
      e.input_headers = e.input_headers.sort();
    }
    if (e.input_query_strings) {
      e.input_query_strings = e.input_query_strings.sort();
    }
  });

  writeFile(filePath, JSON.stringify({ ...schema, endpoints: final }, null, 2), handleWriteFileError);
}

// Access the value of the "service" argument
const serviceName = process.argv[2];
const serviceUrl = `http://localhost:${process.argv[3]}`;

toKrakendService({
  serviceName,
  serviceUrl,
})
  .then(() => console.log('Done'))
  .catch(console.error);
