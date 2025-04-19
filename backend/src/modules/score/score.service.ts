import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner, DataSource } from 'typeorm';
import { Score } from 'src/entities/score.entity';
import { ScoreDetail } from 'src/entities/score_detail.entity';
import { Project } from 'src/entities/project.entity';
import { CreateScoreDetailDto } from './dto/create_score_detail.dto';

@Injectable()
export class ScoreService {
  constructor(
    @InjectRepository(Score)
    private readonly scoreRepository: Repository<Score>,
    @InjectRepository(ScoreDetail)
    private readonly scoreDetailRepository: Repository<ScoreDetail>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    private readonly dataSource: DataSource,
  ) {}

  async createScoreByTeacher(
    projectId: number,
    createScoreDto: CreateScoreDetailDto[],
  ): Promise<Score> {
    // Start a transaction
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate the project
      const project = await this.projectRepository.findOne({
        where: { id: projectId },
        relations: ['groups', 'groups.students'],
      });
      if (!project) {
        throw new Error('Project not found');
      }

      // Create the Score entity
      const score = new Score();
      score.project = project;
      score.group = project.groups[0]; // Assuming one group per project
      score.total_score = 0; // Placeholder, will calculate later
      score.comment = 'Score created by teacher';

      const savedScore = await queryRunner.manager.save(Score, score);

      // Create ScoreDetail entities for each student
      let totalScore = 0;
      for (const detail of createScoreDto) {
        const scoreDetail = new ScoreDetail();
        scoreDetail.score = savedScore;
        // scoreDetail.student = detail.student;
        scoreDetail.scoreValue = detail.scoreValue;
        scoreDetail.comment = detail.comment;

        totalScore += detail.scoreValue;

        await queryRunner.manager.save(ScoreDetail, scoreDetail);
      }

      // Calculate and update the total score
      const averageScore = totalScore / createScoreDto.length;
      savedScore.total_score = averageScore;
      await queryRunner.manager.save(Score, savedScore);

      // Commit the transaction
      await queryRunner.commitTransaction();

      return savedScore;
    } catch (error) {
      // Rollback the transaction in case of an error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }
}
