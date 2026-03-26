import { AxiosError } from 'axios';
import { HttpException } from '@nestjs/common';

export type I18nErrorItem = {
  status?: number;
  msg: string;
  code: string;
};

export interface ErrorMapper {
  map(error: AxiosError): HttpException;
}
