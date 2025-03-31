import { Position } from "src/entities/position.entity";
const positionNames = [
    "Giảng viên",
    "Giáo vụ",
    "Giám khảo phản biện"
]
export class PositionFactory {
  static createMany(): Position[] {
    return positionNames.map(name => {
      const position = new Position();
      position.name = name;
      return position;
    });
  }
}