import { cloneDeep } from 'lodash';
import CircuitBreaker from 'opossum';
import { Logger } from '@nestjs/common';
import {
  AxiosDefaults,
  AxiosInstance,
  AxiosResponse,
  HeadersDefaults,
  AxiosHeaderValue,
  AxiosRequestConfig,
  AxiosInterceptorManager,
  InternalAxiosRequestConfig,
} from 'axios';

type Interceptors = {
  request: AxiosInterceptorManager<InternalAxiosRequestConfig>;
  response: AxiosInterceptorManager<AxiosResponse>;
};

type Defaults = Omit<AxiosDefaults, 'headers'> & {
  headers: HeadersDefaults & { [key: string]: AxiosHeaderValue };
};

export class CircuitBreakerAxios {
  constructor(
    private axios: AxiosInstance,
    readonly breakerOpts?: CircuitBreaker.Options,
  ) {}

  /** ECS Aware Logger */
  #logger = new Logger(this.constructor.name);

  /** A map of url to circuit breaker */
  #circuitBreakers = new Map<string, CircuitBreaker<any, any>>();

  get axiosInstance(): AxiosInstance {
    return cloneDeep(this.axios);
  }

  get interceptors(): Interceptors {
    return this.axios.interceptors;
  }

  set interceptors(interceptors: Interceptors) {
    this.axios.interceptors = interceptors;
  }

  get defaults(): Defaults {
    return this.axios.defaults;
  }

  set defaults(defaults: Defaults) {
    this.axios.defaults = defaults;
  }

  /**
   * Returns the provided function wrapped in a circuit breaker.
   * If a breaker for the provided url already exists, it will be returned, otherwise a new one will be created.
   * @param url The url to use as the key for the breaker
   * @param verb The verb used when making the request
   * @param func The function to wrap in a breaker
   * @param breakerOpts The options to use when creating a new breaker
   */
  #getCircuitBreaker<R>(
    url: string,
    verb: string,
    func: (...args: any[]) => any,
    breakerOpts: CircuitBreaker.Options,
  ): CircuitBreaker<any, R> {
    const key = `${verb}-${url}`;

    if (!this.#circuitBreakers.has(key)) {
      const opts = breakerOpts ?? { ...this.breakerOpts };
      opts.name = `${verb.toUpperCase()} ${this.axios.defaults.baseURL}${url}`;

      const breaker = new CircuitBreaker(func, opts);

      breaker
        .on('failure', (_: Error, __: number, args: any[]) => {
          this.#logger.warn(`Breaker ${opts.name} request failed`, { args });
        })
        .on('timeout', () => this.#logger.warn(`Breaker ${opts.name} request timeout`))
        .on('reject', () => this.#logger.error(`Breaker ${opts.name} request rejected`))
        .on('open', () => this.#logger.warn(`Breaker ${opts.name} opened`))
        .on('halfOpen', () => this.#logger.warn(`Breaker ${opts.name} half-opened`))
        .on('close', () => this.#logger.error(`Breaker ${opts.name} closed. Endpoint is ok`));

      this.#circuitBreakers.set(key, breaker);
    }

    return this.#circuitBreakers.get(key) as CircuitBreaker<any, R>;
  }

  getUri(config?: AxiosRequestConfig): string {
    return this.axios.getUri(config);
  }

  request<T = any, R = AxiosResponse<T>, D = any>(
    config: AxiosRequestConfig<D>,
    breakerOpts: CircuitBreaker.Options | undefined = this.breakerOpts,
  ): Promise<R> {
    // If the caller does not want to use a breaker, we don't force it
    if (!breakerOpts) {
      return this.axios.request<T, R, D>(config);
    }

    return this.#getCircuitBreaker<R>(
      config.url as string,
      config.method as string,
      (config) => this.axios.request<T, R, D>(config),
      breakerOpts,
    ).fire(config);
  }

  get<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    config?: AxiosRequestConfig<D>,
    breakerOpts: CircuitBreaker.Options | undefined = this.breakerOpts,
  ): Promise<R> {
    // If the caller does not want to use a breaker, we don't force it
    if (!breakerOpts) {
      return this.axios.get<T, R, D>(url, config);
    }

    return this.#getCircuitBreaker<R>(
      url,
      'get',
      (url, config) => this.axios.get<T, R, D>(url, config),
      breakerOpts,
    ).fire(url, config);
  }

  delete<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    config?: AxiosRequestConfig<D>,
    breakerOpts: CircuitBreaker.Options | undefined = this.breakerOpts,
  ): Promise<R> {
    // If the caller does not want to use a breaker, we don't force it
    if (!breakerOpts) {
      return this.axios.delete<T, R, D>(url, config);
    }

    return this.#getCircuitBreaker<R>(
      url,
      'delete',
      (url, config) => this.axios.delete<T, R, D>(url, config),
      breakerOpts,
    ).fire(url, config);
  }

  head<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    config?: AxiosRequestConfig<D>,
    breakerOpts: CircuitBreaker.Options | undefined = this.breakerOpts,
  ): Promise<R> {
    // If the caller does not want to use a breaker, we don't force it
    if (!breakerOpts) {
      return this.axios.head<T, R, D>(url, config);
    }

    return this.#getCircuitBreaker<R>(
      url,
      'head',
      (url, config) => this.axios.head<T, R, D>(url, config),
      breakerOpts,
    ).fire(url, config);
  }

  options<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    config?: AxiosRequestConfig<D>,
    breakerOpts: CircuitBreaker.Options | undefined = this.breakerOpts,
  ): Promise<R> {
    // If the caller does not want to use a breaker, we don't force it
    if (!breakerOpts) {
      return this.axios.options<T, R, D>(url, config);
    }

    return this.#getCircuitBreaker<R>(
      url,
      'options',
      (url, config) => this.axios.options<T, R, D>(url, config),
      breakerOpts,
    ).fire(url, config);
  }

  post<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>,
    breakerOpts: CircuitBreaker.Options | undefined = this.breakerOpts,
  ): Promise<R> {
    // If the caller does not want to use a breaker, we don't force it
    if (!breakerOpts) {
      return this.axios.post<T, R, D>(url, data, config);
    }

    return this.#getCircuitBreaker<R>(
      url,
      'post',
      (url, data, config) => this.axios.post<T, R, D>(url, data, config),
      breakerOpts,
    ).fire(url, data, config);
  }

  put<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>,
    breakerOpts: CircuitBreaker.Options | undefined = this.breakerOpts,
  ): Promise<R> {
    // If the caller does not want to use a breaker, we don't force it
    if (!breakerOpts) {
      return this.axios.put<T, R, D>(url, data, config);
    }

    return this.#getCircuitBreaker<R>(
      url,
      'put',
      (url, data, config) => this.axios.put<T, R, D>(url, data, config),
      breakerOpts,
    ).fire(url, data, config);
  }

  patch<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>,
    breakerOpts: CircuitBreaker.Options | undefined = this.breakerOpts,
  ): Promise<R> {
    // If the caller does not want to use a breaker, we don't force it
    if (!breakerOpts) {
      return this.axios.patch<T, R, D>(url, data, config);
    }

    return this.#getCircuitBreaker<R>(
      url,
      'patch',
      (url, data, config) => this.axios.patch<T, R, D>(url, data, config),
      breakerOpts,
    ).fire(url, data, config);
  }

  postForm<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>,
    breakerOpts: CircuitBreaker.Options | undefined = this.breakerOpts,
  ): Promise<R> {
    // If the caller does not want to use a breaker, we don't force it
    if (!breakerOpts) {
      return this.axios.postForm<T, R, D>(url, data, config);
    }

    return this.#getCircuitBreaker<R>(
      url,
      'post',
      (url, data, config) => this.axios.postForm<T, R, D>(url, data, config),
      breakerOpts,
    ).fire(url, data, config);
  }

  putForm<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>,
    breakerOpts: CircuitBreaker.Options | undefined = this.breakerOpts,
  ): Promise<R> {
    // If the caller does not want to use a breaker, we don't force it
    if (!breakerOpts) {
      return this.axios.putForm<T, R, D>(url, data, config);
    }

    return this.#getCircuitBreaker<R>(
      url,
      'put',
      (url, data, config) => this.axios.putForm<T, R, D>(url, data, config),
      breakerOpts,
    ).fire(url, data, config);
  }

  patchForm<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>,
    breakerOpts: CircuitBreaker.Options | undefined = this.breakerOpts,
  ): Promise<R> {
    // If the caller does not want to use a breaker, we don't force it
    if (!breakerOpts) {
      return this.axios.patchForm<T, R, D>(url, data, config);
    }

    return this.#getCircuitBreaker<R>(
      url,
      'patch',
      (url, data, config) => this.axios.patchForm<T, R, D>(url, data, config),
      breakerOpts,
    ).fire(url, data, config);
  }
}
