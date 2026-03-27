import { AxiosError } from 'axios';

import { PlatformException } from '../../exceptions';

export type I18nErrorItem = {
  status?: number;
  msg: string;
  code: string;
};

export interface ErrorMapper {
  map(error: AxiosError): PlatformException;
}
