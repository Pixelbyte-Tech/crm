export type Option = {
  in: 'query' | 'body' | 'params' | 'headers';
  use: string;
  findBy: string;
};
