import { DeepPartial, EntityTarget, FindOneOptions, FindOptionsWhere, In, Like, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { NotFoundException } from '@nestjs/common';

export abstract class BaseService<T> {
  protected constructor(protected readonly repository: Repository<T>) {}
  //thêm một đối tượng
  async create(data: DeepPartial<T> | DeepPartial<T>[]): Promise<T | T[]> {
    if (Array.isArray(data)) {
      return await this.repository.save(data);
    }
    return await this.repository.save(data);
  }
  //lấy một đối tượng bằng id
  async getById(options: FindOneOptions<T>): Promise<T> {
    const entity = await this.repository.findOne(options);
    if (!entity) {
      throw new NotFoundException('Entity not found');
    }
    return entity;
  } 
  // lấy tất cả đối tượng có phân trang
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
    const items = await this.repository.find(options);
    const total = await this.repository.count();

    return { items, total, ...(limit && { limit }), ...(page && { page }) };
  }
  // cập nhật 
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
  // xóa 1 hoặc nhiều
  async delete(ids: number | number[]): Promise<void> {
    const idArray = Array.isArray(ids) ? ids : [ids];
    const where = { id: In(idArray) };
    const options: any = { where };
    const entities = await this.repository.find(options);

    if (entities.length != idArray.length) {
      throw new NotFoundException('One or more entities not found');
    }

    try {
      await this.repository.delete(idArray);
    } catch (error) {
      throw error;
    }
  }

  //====================================BUSINESS LOGIC ======================================================

  //check tồn tại - không trả về dữ liệu
  async check_exist_no_data<T>(
    entity: EntityTarget<T>,
    where: any,
    errorMessage: string,
  ): Promise<void> {
    const existingRecord = await this.repository.manager.findOne(entity, { where });
    
    if (existingRecord) {
      throw new Error(errorMessage); 
    }
  }

  //check không tồn tại - không trả về dữ liệu
  async check_non_exist_no_data<T>(
    entity: EntityTarget<T>,
    where: any,
    errorMessage: string,
  ): Promise<void> {
    const existingRecord = await this.repository.manager.findOne(entity, { where });
    
    if (!existingRecord) {
      throw new Error(errorMessage); 
    }
  }

  //check tồn tại trả về dữ liệu
  async check_exist_with_data<T>(
    entity: EntityTarget<T>,
    where: any,
    errorMessage: string,
  ): Promise<T> {
    const existingRecord = await this.repository.manager.findOne(entity, { where });

    if (!existingRecord && errorMessage) {
      throw new Error(errorMessage);
    }

    return existingRecord; 
  }





}
