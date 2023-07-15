// TODO: Think where these are supposed to go.
export interface ProblemQuery {
  levelFrom?: string;
  levelTo?: string;
  difficultyFrom?: number;
  difficultyTo?: number;
  timeSecondsFrom?: number;
  timeSecondsTo?: number;
  tags?: string[];
  shouldCombineTagsByOr?: boolean;
}
