<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript : Sử dụng làm backend trả vê API cho ứng dụng

## Project setup

```bash
$ yarn
```
## .ENV

Tạo file cấu hình trong root folder đặt tên .env

```bash
APP_PORT = 3022

DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=db
DB_LOGGING=true

JWT_SECRET_KEY=cc25282ab89f24e76ede8b3c70b6d311ef95f4f342dbed4d9bfc7a252df7c039
ACCESS_TOKEN_EXPIRE=3600
REFRESH_TOKEN_EXPIRE=604800 
```

## Chạy sự án và database

```bash

$ yarn dev


```

## Chạy dữ liệu mẫu (Đảm bảo DB được tạo và chưa có dữ liệu ở các bảng)
 
 ```bash
$ yarn seed
```


