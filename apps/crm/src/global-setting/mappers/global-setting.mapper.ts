import { Injectable } from '@nestjs/common';

import { GlobalSetting } from '@crm/types';
import { GlobalSettingEntity } from '@crm/database';

@Injectable()
export class GlobalSettingMapper {
  toSetting(data: GlobalSettingEntity): GlobalSetting {
    const model = new GlobalSetting();
    model.id = data.id;
    model.key = data.key;

    // Parse the value type
    if (['1', 'true', true].includes(data.value.toLowerCase())) {
      model.value = true;
    } else if (['0', 'false', false].includes(data.value.toLowerCase())) {
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
  #isNumeric = (v: unknown): boolean => typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v));
}
