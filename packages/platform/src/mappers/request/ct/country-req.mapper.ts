import { Injectable } from '@nestjs/common';

import { UnknownCountryException } from '../../../exceptions';

@Injectable()
export class CountryReqMapper {
  /**
   * Returns the platform country ID for the given country ISO.
   * @param countryIso The country ISO to lookup
   * @throws UnknownCountryException if the country does not exist
   */
  toCountryId(countryIso: string): number {
    countryIso = countryIso.toUpperCase();

    const item = map.countries.find((item) => item.country.alphaTwoCode === countryIso);
    if (!item?.country) {
      throw new UnknownCountryException(countryIso);
    }

    return item?.country.countryId;
  }
}

/**
 * cTrader does not seem to have an API to get this information
 * @see https://docs.spotware.com/en/WebServices_API/Country_List
 */
type CtCountry = {
  countryName: string;
  alphaTwoCode: string;
  countryId: number;
};

const map: Record<'countries', Record<'country', CtCountry>[]> = {
  countries: [
    {
      country: {
        countryName: 'Afghanistan',
        alphaTwoCode: 'AF',
        countryId: 4,
      },
    },
    {
      country: {
        countryName: 'Albania',
        alphaTwoCode: 'AL',
        countryId: 8,
      },
    },
    {
      country: {
        countryName: 'Antarctica',
        alphaTwoCode: 'AQ',
        countryId: 10,
      },
    },
    {
      country: {
        countryName: 'Algeria',
        alphaTwoCode: 'DZ',
        countryId: 12,
      },
    },
    {
      country: {
        countryName: 'American Samoa',
        alphaTwoCode: 'AS',
        countryId: 16,
      },
    },
    {
      country: {
        countryName: 'Andorra',
        alphaTwoCode: 'AD',
        countryId: 20,
      },
    },
    {
      country: {
        countryName: 'Angola',
        alphaTwoCode: 'AO',
        countryId: 24,
      },
    },
    {
      country: {
        countryName: 'Antigua and Barbuda',
        alphaTwoCode: 'AG',
        countryId: 28,
      },
    },
    {
      country: {
        countryName: 'Azerbaijan',
        alphaTwoCode: 'AZ',
        countryId: 31,
      },
    },
    {
      country: {
        countryName: 'Argentina',
        alphaTwoCode: 'AR',
        countryId: 32,
      },
    },
    {
      country: {
        countryName: 'Australia',
        alphaTwoCode: 'AU',
        countryId: 36,
      },
    },
    {
      country: {
        countryName: 'Austria',
        alphaTwoCode: 'AT',
        countryId: 40,
      },
    },
    {
      country: {
        countryName: 'Bahamas (the)',
        alphaTwoCode: 'BS',
        countryId: 44,
      },
    },
    {
      country: {
        countryName: 'Bahrain',
        alphaTwoCode: 'BH',
        countryId: 48,
      },
    },
    {
      country: {
        countryName: 'Bangladesh',
        alphaTwoCode: 'BD',
        countryId: 50,
      },
    },
    {
      country: {
        countryName: 'Armenia',
        alphaTwoCode: 'AM',
        countryId: 51,
      },
    },
    {
      country: {
        countryName: 'Barbados',
        alphaTwoCode: 'BB',
        countryId: 52,
      },
    },
    {
      country: {
        countryName: 'Belgium',
        alphaTwoCode: 'BE',
        countryId: 56,
      },
    },
    {
      country: {
        countryName: 'Bermuda',
        alphaTwoCode: 'BM',
        countryId: 60,
      },
    },
    {
      country: {
        countryName: 'Bhutan',
        alphaTwoCode: 'BT',
        countryId: 64,
      },
    },
    {
      country: {
        countryName: 'Bolivia (Plurinational State of)',
        alphaTwoCode: 'BO',
        countryId: 68,
      },
    },
    {
      country: {
        countryName: 'Bosnia and Herzegovina',
        alphaTwoCode: 'BA',
        countryId: 70,
      },
    },
    {
      country: {
        countryName: 'Botswana',
        alphaTwoCode: 'BW',
        countryId: 72,
      },
    },
    {
      country: {
        countryName: 'Bouvet Island',
        alphaTwoCode: 'BV',
        countryId: 74,
      },
    },
    {
      country: {
        countryName: 'Brazil',
        alphaTwoCode: 'BR',
        countryId: 76,
      },
    },
    {
      country: {
        countryName: 'Belize',
        alphaTwoCode: 'BZ',
        countryId: 84,
      },
    },
    {
      country: {
        countryName: 'British Indian Ocean Territory (the)',
        alphaTwoCode: 'IO',
        countryId: 86,
      },
    },
    {
      country: {
        countryName: 'Solomon Islands',
        alphaTwoCode: 'SB',
        countryId: 90,
      },
    },
    {
      country: {
        countryName: 'Virgin Islands (British)',
        alphaTwoCode: 'VG',
        countryId: 92,
      },
    },
    {
      country: {
        countryName: 'Brunei Darussalam',
        alphaTwoCode: 'BN',
        countryId: 96,
      },
    },
    {
      country: {
        countryName: 'Bulgaria',
        alphaTwoCode: 'BG',
        countryId: 100,
      },
    },
    {
      country: {
        countryName: 'Myanmar',
        alphaTwoCode: 'MM',
        countryId: 104,
      },
    },
    {
      country: {
        countryName: 'Burundi',
        alphaTwoCode: 'BI',
        countryId: 108,
      },
    },
    {
      country: {
        countryName: 'Belarus',
        alphaTwoCode: 'BY',
        countryId: 112,
      },
    },
    {
      country: {
        countryName: 'Cambodia',
        alphaTwoCode: 'KH',
        countryId: 116,
      },
    },
    {
      country: {
        countryName: 'Cameroon',
        alphaTwoCode: 'CM',
        countryId: 120,
      },
    },
    {
      country: {
        countryName: 'Canada',
        alphaTwoCode: 'CA',
        countryId: 124,
      },
    },
    {
      country: {
        countryName: 'Cabo Verde',
        alphaTwoCode: 'CV',
        countryId: 132,
      },
    },
    {
      country: {
        countryName: 'Cayman Islands (the)',
        alphaTwoCode: 'KY',
        countryId: 136,
      },
    },
    {
      country: {
        countryName: 'Central African Republic (the)',
        alphaTwoCode: 'CF',
        countryId: 140,
      },
    },
    {
      country: {
        countryName: 'Sri Lanka',
        alphaTwoCode: 'LK',
        countryId: 144,
      },
    },
    {
      country: {
        countryName: 'Chad',
        alphaTwoCode: 'TD',
        countryId: 148,
      },
    },
    {
      country: {
        countryName: 'Chile',
        alphaTwoCode: 'CL',
        countryId: 152,
      },
    },
    {
      country: {
        countryName: 'China',
        alphaTwoCode: 'CN',
        countryId: 156,
      },
    },
    {
      country: {
        countryName: 'Taiwan (Province of China)',
        alphaTwoCode: 'TW',
        countryId: 158,
      },
    },
    {
      country: {
        countryName: 'Christmas Island',
        alphaTwoCode: 'CX',
        countryId: 162,
      },
    },
    {
      country: {
        countryName: 'Cocos (Keeling) Islands (the)',
        alphaTwoCode: 'CC',
        countryId: 166,
      },
    },
    {
      country: {
        countryName: 'Colombia',
        alphaTwoCode: 'CO',
        countryId: 170,
      },
    },
    {
      country: {
        countryName: 'Comoros (the)',
        alphaTwoCode: 'KM',
        countryId: 174,
      },
    },
    {
      country: {
        countryName: 'Mayotte',
        alphaTwoCode: 'YT',
        countryId: 175,
      },
    },
    {
      country: {
        countryName: 'Congo (the)',
        alphaTwoCode: 'CG',
        countryId: 178,
      },
    },
    {
      country: {
        countryName: 'Congo (the Democratic Republic of the)',
        alphaTwoCode: 'CD',
        countryId: 180,
      },
    },
    {
      country: {
        countryName: 'Cook Islands (the)',
        alphaTwoCode: 'CK',
        countryId: 184,
      },
    },
    {
      country: {
        countryName: 'Costa Rica',
        alphaTwoCode: 'CR',
        countryId: 188,
      },
    },
    {
      country: {
        countryName: 'Croatia',
        alphaTwoCode: 'HR',
        countryId: 191,
      },
    },
    {
      country: {
        countryName: 'Cuba',
        alphaTwoCode: 'CU',
        countryId: 192,
      },
    },
    {
      country: {
        countryName: 'Cyprus',
        alphaTwoCode: 'CY',
        countryId: 196,
      },
    },
    {
      country: {
        countryName: 'Czechia',
        alphaTwoCode: 'CZ',
        countryId: 203,
      },
    },
    {
      country: {
        countryName: 'Benin',
        alphaTwoCode: 'BJ',
        countryId: 204,
      },
    },
    {
      country: {
        countryName: 'Denmark',
        alphaTwoCode: 'DK',
        countryId: 208,
      },
    },
    {
      country: {
        countryName: 'Dominica',
        alphaTwoCode: 'DM',
        countryId: 212,
      },
    },
    {
      country: {
        countryName: 'Dominican Republic (the)',
        alphaTwoCode: 'DO',
        countryId: 214,
      },
    },
    {
      country: {
        countryName: 'Ecuador',
        alphaTwoCode: 'EC',
        countryId: 218,
      },
    },
    {
      country: {
        countryName: 'El Salvador',
        alphaTwoCode: 'SV',
        countryId: 222,
      },
    },
    {
      country: {
        countryName: 'Equatorial Guinea',
        alphaTwoCode: 'GQ',
        countryId: 226,
      },
    },
    {
      country: {
        countryName: 'Ethiopia',
        alphaTwoCode: 'ET',
        countryId: 231,
      },
    },
    {
      country: {
        countryName: 'Eritrea',
        alphaTwoCode: 'ER',
        countryId: 232,
      },
    },
    {
      country: {
        countryName: 'Estonia',
        alphaTwoCode: 'EE',
        countryId: 233,
      },
    },
    {
      country: {
        countryName: 'Faroe Islands (the)',
        alphaTwoCode: 'FO',
        countryId: 234,
      },
    },
    {
      country: {
        countryName: 'Falkland Islands (the) [Malvinas]',
        alphaTwoCode: 'FK',
        countryId: 238,
      },
    },
    {
      country: {
        countryName: 'South Georgia and the South Sandwich Islands',
        alphaTwoCode: 'GS',
        countryId: 239,
      },
    },
    {
      country: {
        countryName: 'Fiji',
        alphaTwoCode: 'FJ',
        countryId: 242,
      },
    },
    {
      country: {
        countryName: 'Finland',
        alphaTwoCode: 'FI',
        countryId: 246,
      },
    },
    {
      country: {
        countryName: 'Åland Islands',
        alphaTwoCode: 'AX',
        countryId: 248,
      },
    },
    {
      country: {
        countryName: 'France',
        alphaTwoCode: 'FR',
        countryId: 250,
      },
    },
    {
      country: {
        countryName: 'French Guiana',
        alphaTwoCode: 'GF',
        countryId: 254,
      },
    },
    {
      country: {
        countryName: 'French Polynesia',
        alphaTwoCode: 'PF',
        countryId: 258,
      },
    },
    {
      country: {
        countryName: 'French Southern Territories (the)',
        alphaTwoCode: 'TF',
        countryId: 260,
      },
    },
    {
      country: {
        countryName: 'Djibouti',
        alphaTwoCode: 'DJ',
        countryId: 262,
      },
    },
    {
      country: {
        countryName: 'Gabon',
        alphaTwoCode: 'GA',
        countryId: 266,
      },
    },
    {
      country: {
        countryName: 'Georgia',
        alphaTwoCode: 'GE',
        countryId: 268,
      },
    },
    {
      country: {
        countryName: 'Gambia (the)',
        alphaTwoCode: 'GM',
        countryId: 270,
      },
    },
    {
      country: {
        countryName: 'Palestine, State of',
        alphaTwoCode: 'PS',
        countryId: 275,
      },
    },
    {
      country: {
        countryName: 'Germany',
        alphaTwoCode: 'DE',
        countryId: 276,
      },
    },
    {
      country: {
        countryName: 'Ghana',
        alphaTwoCode: 'GH',
        countryId: 288,
      },
    },
    {
      country: {
        countryName: 'Gibraltar',
        alphaTwoCode: 'GI',
        countryId: 292,
      },
    },
    {
      country: {
        countryName: 'Kiribati',
        alphaTwoCode: 'KI',
        countryId: 296,
      },
    },
    {
      country: {
        countryName: 'Greece',
        alphaTwoCode: 'GR',
        countryId: 300,
      },
    },
    {
      country: {
        countryName: 'Greenland',
        alphaTwoCode: 'GL',
        countryId: 304,
      },
    },
    {
      country: {
        countryName: 'Grenada',
        alphaTwoCode: 'GD',
        countryId: 308,
      },
    },
    {
      country: {
        countryName: 'Guadeloupe',
        alphaTwoCode: 'GP',
        countryId: 312,
      },
    },
    {
      country: {
        countryName: 'Guam',
        alphaTwoCode: 'GU',
        countryId: 316,
      },
    },
    {
      country: {
        countryName: 'Guatemala',
        alphaTwoCode: 'GT',
        countryId: 320,
      },
    },
    {
      country: {
        countryName: 'Guinea',
        alphaTwoCode: 'GN',
        countryId: 324,
      },
    },
    {
      country: {
        countryName: 'Guyana',
        alphaTwoCode: 'GY',
        countryId: 328,
      },
    },
    {
      country: {
        countryName: 'Haiti',
        alphaTwoCode: 'HT',
        countryId: 332,
      },
    },
    {
      country: {
        countryName: 'Heard Island and McDonald Islands',
        alphaTwoCode: 'HM',
        countryId: 334,
      },
    },
    {
      country: {
        countryName: 'Holy See (the)',
        alphaTwoCode: 'VA',
        countryId: 336,
      },
    },
    {
      country: {
        countryName: 'Honduras',
        alphaTwoCode: 'HN',
        countryId: 340,
      },
    },
    {
      country: {
        countryName: 'Hong Kong',
        alphaTwoCode: 'HK',
        countryId: 344,
      },
    },
    {
      country: {
        countryName: 'Hungary',
        alphaTwoCode: 'HU',
        countryId: 348,
      },
    },
    {
      country: {
        countryName: 'Iceland',
        alphaTwoCode: 'IS',
        countryId: 352,
      },
    },
    {
      country: {
        countryName: 'India',
        alphaTwoCode: 'IN',
        countryId: 356,
      },
    },
    {
      country: {
        countryName: 'Indonesia',
        alphaTwoCode: 'ID',
        countryId: 360,
      },
    },
    {
      country: {
        countryName: 'Iran (Islamic Republic of)',
        alphaTwoCode: 'IR',
        countryId: 364,
      },
    },
    {
      country: {
        countryName: 'Iraq',
        alphaTwoCode: 'IQ',
        countryId: 368,
      },
    },
    {
      country: {
        countryName: 'Ireland',
        alphaTwoCode: 'IE',
        countryId: 372,
      },
    },
    {
      country: {
        countryName: 'Israel',
        alphaTwoCode: 'IL',
        countryId: 376,
      },
    },
    {
      country: {
        countryName: 'Italy',
        alphaTwoCode: 'IT',
        countryId: 380,
      },
    },
    {
      country: {
        countryName: "Côte d'Ivoire",
        alphaTwoCode: 'CI',
        countryId: 384,
      },
    },
    {
      country: {
        countryName: 'Jamaica',
        alphaTwoCode: 'JM',
        countryId: 388,
      },
    },
    {
      country: {
        countryName: 'Japan',
        alphaTwoCode: 'JP',
        countryId: 392,
      },
    },
    {
      country: {
        countryName: 'Kazakhstan',
        alphaTwoCode: 'KZ',
        countryId: 398,
      },
    },
    {
      country: {
        countryName: 'Jordan',
        alphaTwoCode: 'JO',
        countryId: 400,
      },
    },
    {
      country: {
        countryName: 'Kenya',
        alphaTwoCode: 'KE',
        countryId: 404,
      },
    },
    {
      country: {
        countryName: "Korea (the Democratic People's Republic of)",
        alphaTwoCode: 'KP',
        countryId: 408,
      },
    },
    {
      country: {
        countryName: 'Korea (the Republic of)',
        alphaTwoCode: 'KR',
        countryId: 410,
      },
    },
    {
      country: {
        countryName: 'Kuwait',
        alphaTwoCode: 'KW',
        countryId: 414,
      },
    },
    {
      country: {
        countryName: 'Kyrgyzstan',
        alphaTwoCode: 'KG',
        countryId: 417,
      },
    },
    {
      country: {
        countryName: "Lao People's Democratic Republic (the)",
        alphaTwoCode: 'LA',
        countryId: 418,
      },
    },
    {
      country: {
        countryName: 'Lebanon',
        alphaTwoCode: 'LB',
        countryId: 422,
      },
    },
    {
      country: {
        countryName: 'Lesotho',
        alphaTwoCode: 'LS',
        countryId: 426,
      },
    },
    {
      country: {
        countryName: 'Latvia',
        alphaTwoCode: 'LV',
        countryId: 428,
      },
    },
    {
      country: {
        countryName: 'Liberia',
        alphaTwoCode: 'LR',
        countryId: 430,
      },
    },
    {
      country: {
        countryName: 'Libya',
        alphaTwoCode: 'LY',
        countryId: 434,
      },
    },
    {
      country: {
        countryName: 'Liechtenstein',
        alphaTwoCode: 'LI',
        countryId: 438,
      },
    },
    {
      country: {
        countryName: 'Lithuania',
        alphaTwoCode: 'LT',
        countryId: 440,
      },
    },
    {
      country: {
        countryName: 'Luxembourg',
        alphaTwoCode: 'LU',
        countryId: 442,
      },
    },
    {
      country: {
        countryName: 'Macao',
        alphaTwoCode: 'MO',
        countryId: 446,
      },
    },
    {
      country: {
        countryName: 'Madagascar',
        alphaTwoCode: 'MG',
        countryId: 450,
      },
    },
    {
      country: {
        countryName: 'Malawi',
        alphaTwoCode: 'MW',
        countryId: 454,
      },
    },
    {
      country: {
        countryName: 'Malaysia',
        alphaTwoCode: 'MY',
        countryId: 458,
      },
    },
    {
      country: {
        countryName: 'Maldives',
        alphaTwoCode: 'MV',
        countryId: 462,
      },
    },
    {
      country: {
        countryName: 'Mali',
        alphaTwoCode: 'ML',
        countryId: 466,
      },
    },
    {
      country: {
        countryName: 'Malta',
        alphaTwoCode: 'MT',
        countryId: 470,
      },
    },
    {
      country: {
        countryName: 'Martinique',
        alphaTwoCode: 'MQ',
        countryId: 474,
      },
    },
    {
      country: {
        countryName: 'Mauritania',
        alphaTwoCode: 'MR',
        countryId: 478,
      },
    },
    {
      country: {
        countryName: 'Mauritius',
        alphaTwoCode: 'MU',
        countryId: 480,
      },
    },
    {
      country: {
        countryName: 'Mexico',
        alphaTwoCode: 'MX',
        countryId: 484,
      },
    },
    {
      country: {
        countryName: 'Monaco',
        alphaTwoCode: 'MC',
        countryId: 492,
      },
    },
    {
      country: {
        countryName: 'Mongolia',
        alphaTwoCode: 'MN',
        countryId: 496,
      },
    },
    {
      country: {
        countryName: 'Moldova (the Republic of)',
        alphaTwoCode: 'MD',
        countryId: 498,
      },
    },
    {
      country: {
        countryName: 'Montenegro',
        alphaTwoCode: 'ME',
        countryId: 499,
      },
    },
    {
      country: {
        countryName: 'Montserrat',
        alphaTwoCode: 'MS',
        countryId: 500,
      },
    },
    {
      country: {
        countryName: 'Morocco',
        alphaTwoCode: 'MA',
        countryId: 504,
      },
    },
    {
      country: {
        countryName: 'Mozambique',
        alphaTwoCode: 'MZ',
        countryId: 508,
      },
    },
    {
      country: {
        countryName: 'Oman',
        alphaTwoCode: 'OM',
        countryId: 512,
      },
    },
    {
      country: {
        countryName: 'Namibia',
        alphaTwoCode: 'NA',
        countryId: 516,
      },
    },
    {
      country: {
        countryName: 'Nauru',
        alphaTwoCode: 'NR',
        countryId: 520,
      },
    },
    {
      country: {
        countryName: 'Nepal',
        alphaTwoCode: 'NP',
        countryId: 524,
      },
    },
    {
      country: {
        countryName: 'Netherlands (Kingdom of the)',
        alphaTwoCode: 'NL',
        countryId: 528,
      },
    },
    {
      country: {
        countryName: 'Curaçao',
        alphaTwoCode: 'CW',
        countryId: 531,
      },
    },
    {
      country: {
        countryName: 'Aruba',
        alphaTwoCode: 'AW',
        countryId: 533,
      },
    },
    {
      country: {
        countryName: 'Sint Maarten (Dutch part)',
        alphaTwoCode: 'SX',
        countryId: 534,
      },
    },
    {
      country: {
        countryName: 'Bonaire',
        alphaTwoCode: 'BQ',
        countryId: 535,
      },
    },
    {
      country: {
        countryName: 'New Caledonia',
        alphaTwoCode: 'NC',
        countryId: 540,
      },
    },
    {
      country: {
        countryName: 'Vanuatu',
        alphaTwoCode: 'VU',
        countryId: 548,
      },
    },
    {
      country: {
        countryName: 'New Zealand',
        alphaTwoCode: 'NZ',
        countryId: 554,
      },
    },
    {
      country: {
        countryName: 'Nicaragua',
        alphaTwoCode: 'NI',
        countryId: 558,
      },
    },
    {
      country: {
        countryName: 'Niger (the)',
        alphaTwoCode: 'NE',
        countryId: 562,
      },
    },
    {
      country: {
        countryName: 'Nigeria',
        alphaTwoCode: 'NG',
        countryId: 566,
      },
    },
    {
      country: {
        countryName: 'Niue',
        alphaTwoCode: 'NU',
        countryId: 570,
      },
    },
    {
      country: {
        countryName: 'Norfolk Island',
        alphaTwoCode: 'NF',
        countryId: 574,
      },
    },
    {
      country: {
        countryName: 'Norway',
        alphaTwoCode: 'NO',
        countryId: 578,
      },
    },
    {
      country: {
        countryName: 'Northern Mariana Islands (the)',
        alphaTwoCode: 'MP',
        countryId: 580,
      },
    },
    {
      country: {
        countryName: 'United States Minor Outlying Islands (the)',
        alphaTwoCode: 'UM',
        countryId: 581,
      },
    },
    {
      country: {
        countryName: 'Micronesia (Federated States of)',
        alphaTwoCode: 'FM',
        countryId: 583,
      },
    },
    {
      country: {
        countryName: 'Marshall Islands (the)',
        alphaTwoCode: 'MH',
        countryId: 584,
      },
    },
    {
      country: {
        countryName: 'Palau',
        alphaTwoCode: 'PW',
        countryId: 585,
      },
    },
    {
      country: {
        countryName: 'Pakistan',
        alphaTwoCode: 'PK',
        countryId: 586,
      },
    },
    {
      country: {
        countryName: 'Panama',
        alphaTwoCode: 'PA',
        countryId: 591,
      },
    },
    {
      country: {
        countryName: 'Papua New Guinea',
        alphaTwoCode: 'PG',
        countryId: 598,
      },
    },
    {
      country: {
        countryName: 'Paraguay',
        alphaTwoCode: 'PY',
        countryId: 600,
      },
    },
    {
      country: {
        countryName: 'Peru',
        alphaTwoCode: 'PE',
        countryId: 604,
      },
    },
    {
      country: {
        countryName: 'Philippines (the)',
        alphaTwoCode: 'PH',
        countryId: 608,
      },
    },
    {
      country: {
        countryName: 'Pitcairn',
        alphaTwoCode: 'PN',
        countryId: 612,
      },
    },
    {
      country: {
        countryName: 'Poland',
        alphaTwoCode: 'PL',
        countryId: 616,
      },
    },
    {
      country: {
        countryName: 'Portugal',
        alphaTwoCode: 'PT',
        countryId: 620,
      },
    },
    {
      country: {
        countryName: 'Guinea-Bissau',
        alphaTwoCode: 'GW',
        countryId: 624,
      },
    },
    {
      country: {
        countryName: 'Timor-Leste',
        alphaTwoCode: 'TL',
        countryId: 626,
      },
    },
    {
      country: {
        countryName: 'Puerto Rico',
        alphaTwoCode: 'PR',
        countryId: 630,
      },
    },
    {
      country: {
        countryName: 'Qatar',
        alphaTwoCode: 'QA',
        countryId: 634,
      },
    },
    {
      country: {
        countryName: 'Réunion',
        alphaTwoCode: 'RE',
        countryId: 638,
      },
    },
    {
      country: {
        countryName: 'Romania',
        alphaTwoCode: 'RO',
        countryId: 642,
      },
    },
    {
      country: {
        countryName: 'Russian Federation (the)',
        alphaTwoCode: 'RU',
        countryId: 643,
      },
    },
    {
      country: {
        countryName: 'Rwanda',
        alphaTwoCode: 'RW',
        countryId: 646,
      },
    },
    {
      country: {
        countryName: 'Saint Barthélemy',
        alphaTwoCode: 'BL',
        countryId: 652,
      },
    },
    {
      country: {
        countryName: 'Saint Helena',
        alphaTwoCode: 'SH',
        countryId: 654,
      },
    },
    {
      country: {
        countryName: 'Saint Kitts and Nevis',
        alphaTwoCode: 'KN',
        countryId: 659,
      },
    },
    {
      country: {
        countryName: 'Anguilla',
        alphaTwoCode: 'AI',
        countryId: 660,
      },
    },
    {
      country: {
        countryName: 'Saint Lucia',
        alphaTwoCode: 'LC',
        countryId: 662,
      },
    },
    {
      country: {
        countryName: 'Saint Martin (French part)',
        alphaTwoCode: 'MF',
        countryId: 663,
      },
    },
    {
      country: {
        countryName: 'Saint Pierre and Miquelon',
        alphaTwoCode: 'PM',
        countryId: 666,
      },
    },
    {
      country: {
        countryName: 'Saint Vincent and the Grenadines',
        alphaTwoCode: 'VC',
        countryId: 670,
      },
    },
    {
      country: {
        countryName: 'San Marino',
        alphaTwoCode: 'SM',
        countryId: 674,
      },
    },
    {
      country: {
        countryName: 'Sao Tome and Principe',
        alphaTwoCode: 'ST',
        countryId: 678,
      },
    },
    {
      country: {
        countryName: 'Saudi Arabia',
        alphaTwoCode: 'SA',
        countryId: 682,
      },
    },
    {
      country: {
        countryName: 'Senegal',
        alphaTwoCode: 'SN',
        countryId: 686,
      },
    },
    {
      country: {
        countryName: 'Serbia',
        alphaTwoCode: 'RS',
        countryId: 688,
      },
    },
    {
      country: {
        countryName: 'Seychelles',
        alphaTwoCode: 'SC',
        countryId: 690,
      },
    },
    {
      country: {
        countryName: 'Sierra Leone',
        alphaTwoCode: 'SL',
        countryId: 694,
      },
    },
    {
      country: {
        countryName: 'Singapore',
        alphaTwoCode: 'SG',
        countryId: 702,
      },
    },
    {
      country: {
        countryName: 'Slovakia',
        alphaTwoCode: 'SK',
        countryId: 703,
      },
    },
    {
      country: {
        countryName: 'Viet Nam',
        alphaTwoCode: 'VN',
        countryId: 704,
      },
    },
    {
      country: {
        countryName: 'Slovenia',
        alphaTwoCode: 'SI',
        countryId: 705,
      },
    },
    {
      country: {
        countryName: 'Somalia',
        alphaTwoCode: 'SO',
        countryId: 706,
      },
    },
    {
      country: {
        countryName: 'South Africa',
        alphaTwoCode: 'ZA',
        countryId: 710,
      },
    },
    {
      country: {
        countryName: 'Zimbabwe',
        alphaTwoCode: 'ZW',
        countryId: 716,
      },
    },
    {
      country: {
        countryName: 'Spain',
        alphaTwoCode: 'ES',
        countryId: 724,
      },
    },
    {
      country: {
        countryName: 'South Sudan',
        alphaTwoCode: 'SS',
        countryId: 728,
      },
    },
    {
      country: {
        countryName: 'Sudan (the)',
        alphaTwoCode: 'SD',
        countryId: 729,
      },
    },
    {
      country: {
        countryName: 'Western Sahara',
        alphaTwoCode: 'EH',
        countryId: 732,
      },
    },
    {
      country: {
        countryName: 'Suriname',
        alphaTwoCode: 'SR',
        countryId: 740,
      },
    },
    {
      country: {
        countryName: 'Svalbard and Jan Mayen',
        alphaTwoCode: 'SJ',
        countryId: 744,
      },
    },
    {
      country: {
        countryName: 'Swaziland',
        alphaTwoCode: 'SZ',
        countryId: 748,
      },
    },
    {
      country: {
        countryName: 'Eswatini',
        alphaTwoCode: 'SZ',
        countryId: 748,
      },
    },
    {
      country: {
        countryName: 'Sweden',
        alphaTwoCode: 'SE',
        countryId: 752,
      },
    },
    {
      country: {
        countryName: 'Switzerland',
        alphaTwoCode: 'CH',
        countryId: 756,
      },
    },
    {
      country: {
        countryName: 'Syrian Arab Republic (the)',
        alphaTwoCode: 'SY',
        countryId: 760,
      },
    },
    {
      country: {
        countryName: 'Tajikistan',
        alphaTwoCode: 'TJ',
        countryId: 762,
      },
    },
    {
      country: {
        countryName: 'Thailand',
        alphaTwoCode: 'TH',
        countryId: 764,
      },
    },
    {
      country: {
        countryName: 'Togo',
        alphaTwoCode: 'TG',
        countryId: 768,
      },
    },
    {
      country: {
        countryName: 'Tokelau',
        alphaTwoCode: 'TK',
        countryId: 772,
      },
    },
    {
      country: {
        countryName: 'Tonga',
        alphaTwoCode: 'TO',
        countryId: 776,
      },
    },
    {
      country: {
        countryName: 'Trinidad and Tobago',
        alphaTwoCode: 'TT',
        countryId: 780,
      },
    },
    {
      country: {
        countryName: 'United Arab Emirates (the)',
        alphaTwoCode: 'AE',
        countryId: 784,
      },
    },
    {
      country: {
        countryName: 'Tunisia',
        alphaTwoCode: 'TN',
        countryId: 788,
      },
    },
    {
      country: {
        countryName: 'Türkiye',
        alphaTwoCode: 'TR',
        countryId: 792,
      },
    },
    {
      country: {
        countryName: 'Turkmenistan',
        alphaTwoCode: 'TM',
        countryId: 795,
      },
    },
    {
      country: {
        countryName: 'Turks and Caicos Islands (the)',
        alphaTwoCode: 'TC',
        countryId: 796,
      },
    },
    {
      country: {
        countryName: 'Tuvalu',
        alphaTwoCode: 'TV',
        countryId: 798,
      },
    },
    {
      country: {
        countryName: 'Uganda',
        alphaTwoCode: 'UG',
        countryId: 800,
      },
    },
    {
      country: {
        countryName: 'Ukraine',
        alphaTwoCode: 'UA',
        countryId: 804,
      },
    },
    {
      country: {
        countryName: 'North Macedonia',
        alphaTwoCode: 'MK',
        countryId: 807,
      },
    },
    {
      country: {
        countryName: 'Egypt',
        alphaTwoCode: 'EG',
        countryId: 818,
      },
    },
    {
      country: {
        countryName: 'United Kingdom of Great Britain and Northern Ireland (the)',
        alphaTwoCode: 'GB',
        countryId: 826,
      },
    },
    {
      country: {
        countryName: 'Guernsey',
        alphaTwoCode: 'GG',
        countryId: 831,
      },
    },
    {
      country: {
        countryName: 'Jersey',
        alphaTwoCode: 'JE',
        countryId: 832,
      },
    },
    {
      country: {
        countryName: 'Isle of Man',
        alphaTwoCode: 'IM',
        countryId: 833,
      },
    },
    {
      country: {
        countryName: 'Tanzania',
        alphaTwoCode: 'TZ',
        countryId: 834,
      },
    },
    {
      country: {
        countryName: 'United States of America (the)',
        alphaTwoCode: 'US',
        countryId: 840,
      },
    },
    {
      country: {
        countryName: 'Virgin Islands (U.S.)',
        alphaTwoCode: 'VI',
        countryId: 850,
      },
    },
    {
      country: {
        countryName: 'Burkina Faso',
        alphaTwoCode: 'BF',
        countryId: 854,
      },
    },
    {
      country: {
        countryName: 'Uruguay',
        alphaTwoCode: 'UY',
        countryId: 858,
      },
    },
    {
      country: {
        countryName: 'Uzbekistan',
        alphaTwoCode: 'UZ',
        countryId: 860,
      },
    },
    {
      country: {
        countryName: 'Venezuela (Bolivarian Republic of)',
        alphaTwoCode: 'VE',
        countryId: 862,
      },
    },
    {
      country: {
        countryName: 'Wallis and Futuna',
        alphaTwoCode: 'WF',
        countryId: 876,
      },
    },
    {
      country: {
        countryName: 'Samoa',
        alphaTwoCode: 'WS',
        countryId: 882,
      },
    },
    {
      country: {
        countryName: 'Yemen',
        alphaTwoCode: 'YE',
        countryId: 887,
      },
    },
    {
      country: {
        countryName: 'Zambia',
        alphaTwoCode: 'ZM',
        countryId: 894,
      },
    },
  ],
};
