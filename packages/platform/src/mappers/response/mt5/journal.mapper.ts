import { DateTime } from 'luxon';
import { Injectable } from '@nestjs/common';

import { JournalEntry } from '../../../models/journal-entry';
import { Mt5JournalEntry } from '../../../types/mt5/statistics/journal-entry.type';

@Injectable()
export class JournalMapper {
  toJournalEntry(data: Mt5JournalEntry, utcOffsetSec: number): JournalEntry {
    return {
      createdAt: DateTime.fromSeconds(data.datetime).minus({ second: utcOffsetSec }).toJSDate(),
      data: data,
    } as JournalEntry;
  }

  toJournalEntries(data: Mt5JournalEntry[], utcOffsetSec: number): JournalEntry[] {
    return data.map((entry) => {
      return {
        createdAt: DateTime.fromSeconds(entry.datetime).minus({ second: utcOffsetSec }).toJSDate(),
        data: entry,
      };
    });
  }
}
