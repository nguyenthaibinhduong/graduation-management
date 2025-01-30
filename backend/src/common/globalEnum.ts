export enum HttpStatus {
  ERROR = 404,
  SUCCESS = 200,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  CONFLICT = 409,
}

export enum Message {
  UNAUTHORIZED = 'Request Unauthorized',
  FORBIDDEN = 'Request Forbidden',
  CONFLICT = 'Request Conflict',
  ERROR = 'Request Error',
  SUCCESS = 'Response Successfully',
}
