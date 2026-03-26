export class UserGroupDto {
  /** The id of the user group on the related platform */
  id: string;
  /** The name of the user group on the related platform */
  name: string;

  constructor(data: UserGroupDto) {
    this.id = data.id;
    this.name = data.name;
  }
}
