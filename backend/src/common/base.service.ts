import { DeepPartial, FindOneOptions, Like, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export abstract class BaseService<T> {
  protected constructor(protected readonly repository: Repository<T>) {}

  async create(data: DeepPartial<T>) {
    return await this.repository.save(data);
  }

  async getById(options: FindOneOptions<T>): Promise<T> {
    return this.repository.findOne(options);
  }

  async getAll(
    search?: string,
    limit?: number,
    page?: number,
  ): Promise<{ items: T[]; total: number; limit?: number; page?: number }> {
    const whereConditions: any = {};

    // Thêm điều kiện tìm kiếm theo tên nếu có
    if (search) {
      whereConditions.name = Like(`%${search}%`);
    }

    let items: T[] = [];
    let total: number = 0;

    if (limit && page) {
      // Trường hợp có phân trang
      [items, total] = await this.repository.findAndCount({
        where: whereConditions,
        take: limit, // Lấy số bản ghi theo limit
        skip: (page - 1) * limit, // Vị trí bắt đầu của phân trang
      });
    } else {
      // Trường hợp không có limit và page, lấy tất cả dữ liệu
      items = await this.repository.find({
        where: whereConditions,
      });
      total = items.length; // Tổng số bản ghi
    }

    const result: any = { items, total };

    // Chỉ thêm limit và page nếu có giá trị
    if (limit) result.limit = limit as number;
    if (page) result.page = page as number;

    return result;
  }

  async update(
    id: number,
    options: FindOneOptions<T>,
    entity: DeepPartial<T>,
  ): Promise<T> {
    await this.repository.update(id, entity as QueryDeepPartialEntity<T>);
    return this.getById(options);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
