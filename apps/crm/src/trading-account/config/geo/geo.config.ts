import { IsString } from 'class-validator';
import { registerAs } from '@nestjs/config';

import { validateConfig } from '@crm/utils';

import { GeoConfig } from './geo-config.type';

class GeoConfigValidator {
  @IsString()
  GEOIP_ACCOUNT_ID: string;

  @IsString()
  GEOIP_LICENSE_KEY: string;
}

export default registerAs<GeoConfig>('geo', () => {
  validateConfig(process.env, GeoConfigValidator);

  return {
    accountId: process.env.GEOIP_ACCOUNT_ID ?? '',
    licenseKey: process.env.GEOIP_LICENSE_KEY ?? '',
  };
});
