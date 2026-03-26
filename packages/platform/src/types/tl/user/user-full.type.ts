export interface TlUserFull {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  server: string;
  phoneNumber: string;
  gender: 'MALE' | 'FEMALE';
  language: string;
  comment: string;
  createdDateTime: string; // format '2020-01-01T00:00:00.000Z';
}
