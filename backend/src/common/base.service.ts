import { DeepPartial, FindOneOptions, Like, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { NotFoundException } from '@nestjs/common';

export abstract class BaseService<T> {
  protected constructor(protected readonly repository: Repository<T>) {}

  async create(data: DeepPartial<T>): Promise<T> {
    return await this.repository.save(data);
  }

  async getById(options: FindOneOptions<T>): Promise<T> {
    const entity = await this.repository.findOne(options);
    if (!entity) {
      throw new NotFoundException('Entity not found');
    }
    return entity;
  }

  async getAll(
    search?: string, // Cho phép tìm kiếm theo nhiều trường
    limit: number = 10,
    page: number = 1,
    // Hỗ trợ sắp xếp
  ): Promise<{ items: T[]; total: number; limit: number; page: number }> {
    const whereConditions: any = {};

    // Thêm điều kiện tìm kiếm theo tên nếu có
    if (search) {
      whereConditions.name = Like(`%${search}%`);
    }

    const [items, total] = await this.repository.findAndCount({
      where: whereConditions.length ? whereConditions : undefined,
      take: limit,
      skip: (page - 1) * limit,
    });

    return { items, total, limit, page };
  }

  async update(
    id: number,
    options: FindOneOptions<T>,
    entity: DeepPartial<T>,
  ): Promise<T> {
    const existingEntity = await this.getById(options);
    if (!existingEntity) {
      throw new NotFoundException('Entity not found');
    }

    await this.repository.update(id, entity as QueryDeepPartialEntity<T>);
    return this.getById(options);
  }

  async delete(id: number): Promise<void> {
    const entity = await this.repository.findOne({ where: { id } as any });
    if (!entity) {
      throw new NotFoundException('Entity not found');
    }
    await this.repository.delete(id);
  }
}
