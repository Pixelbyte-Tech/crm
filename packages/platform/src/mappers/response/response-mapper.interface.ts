export interface ResponseMapper {
  get<T>(name: string): T;
}
