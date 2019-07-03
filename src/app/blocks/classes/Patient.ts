export class Patient {
  constructor(
    public id: string | null = null,
    public name: string = null,
    public contact: string | null = null,
    public email: string | null = null,
  ) {}
}
