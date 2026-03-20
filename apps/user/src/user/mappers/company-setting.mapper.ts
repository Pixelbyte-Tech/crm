import { Injectable } from '@nestjs/common';

import { CompanySettingEntity } from '@crm/database';
import { CompanySetting, CompanySettingKey } from '@crm/types';

@Injectable()
export class CompanySettingMapper {
  toSetting(data: CompanySettingEntity): CompanySetting {
    const model = new CompanySetting();
    model.id = data.id;
    model.key = data.key as unknown as CompanySettingKey;

    // Parse the value type
    if (['1', 'true'].includes(data.value.toLowerCase())) {
      model.value = true;
    } else if (['0', 'false'].includes(data.value.toLowerCase())) {
      model.value = false;
    } else if (this.#isNumeric(data.value)) {
      model.value = Number(data.value);
    } else {
      model.value = data.value;
    }

    model.createdAt = data.createdAt;
    model.updatedAt = data.updatedAt;
    return model;
  }

  /**
   * Returns true if a string is numeric
   * @param v The string to check
   */
  #isNumeric = (v: unknown) => typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v));
}
