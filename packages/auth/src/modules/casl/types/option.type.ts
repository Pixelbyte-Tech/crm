export type Option = {
  in: 'query' | 'body' | 'params' | 'headers';
  param: string;
};
