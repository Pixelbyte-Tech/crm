export interface RequestMapper {
  get<T>(name: string): T;
}
