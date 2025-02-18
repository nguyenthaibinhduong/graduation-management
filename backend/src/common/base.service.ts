import { DeepPartial, FindOneOptions, Like, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { NotFoundException } from '@nestjs/common';

export abstract class BaseService<T> {
  protected constructor(protected readonly repository: Repository<T>) {}

  async create(data: DeepPartial<T> | DeepPartial<T>[]): Promise<T | T[]> {
    if (Array.isArray(data)) {
      return await this.repository.save(data);
    }
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
    search?: string,
    limit?: number,
    page?: number,
  ): Promise<{ items: T[]; total: number; limit?: number; page?: number }> {
    const where = search ? { name: Like(`%${search}%`) } : {};
    const options: any = { where };

    if (limit && page) {
      options.take = limit;
      options.skip = (page - 1) * limit;
    }

    // Lấy danh sách items theo search, limit, page
    const items = await this.repository.find(options);

    // Luôn lấy tổng số bản ghi thực tế không bị ảnh hưởng bởi search
    const total = await this.repository.count();

    return { items, total, ...(limit && { limit }), ...(page && { page }) };
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
