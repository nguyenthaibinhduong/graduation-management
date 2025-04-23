import { Module } from '@nestjs/common';
import { ScoreService } from './score.service';
import { ScoreController } from './score.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Score } from 'src/entities/score.entity';
import { ScoreDetail } from 'src/entities/score_detail.entity';
import { Project } from 'src/entities/project.entity';
import { Group } from 'src/entities/group.entity';
import { Student } from 'src/entities/student.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Score, ScoreDetail, Project, Group, Student]),
  ],
  controllers: [ScoreController],
  providers: [ScoreService],
})
export class ScoreModule {}
