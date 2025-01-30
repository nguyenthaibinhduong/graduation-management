export class Response<D> {
  statusCode: number;
  message: string;
  data: D | D[];
  constructor(data: D | D[], statusCode: number, message: string) {
    this.data = data;
    this.statusCode = statusCode;
    this.message = message;
    return this;
  }
}
