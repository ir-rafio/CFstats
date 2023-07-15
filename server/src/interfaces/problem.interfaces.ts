import { ContestInfo } from './contest.interfaces';

export class Problem {
  constructor(
    public contest: ContestInfo,
    public index: string,
    public name: string,
    public tags: string[],
    public difficulty?: number
  ) {}

  getKey(): string {
    return Problem.generateKey(this.contest.id, this.index);
  }

  getLevel(): string {
    const { index } = this;
    return Problem.getLevel(index);
  }

  static generateKey = (contestId: number, index: string): string => {
    return `${contestId}-${index}`;
  };

  static parseKey = (key: string): { contestId: number; index: string } => {
    const [contestStr, index] = key.split('-');
    const contestId = Number(contestStr);

    return { contestId, index };
  };

  static getLevel = (index: string): string => {
    return index && index[0].match(/[A-Za-z]/) ? index[0].toUpperCase() : '0';
  };
}

export class Problemset {
  problems: Problem[] = [];
  levels: Record<string, number> = {};
  difficulties: Record<string, number> = {};
  tags: Record<string, number> = {};

  constructor(problems: Problem[]) {
    const levels: Record<string, number> = {};
    const difficulties: Record<string, number> = {};
    const tags: Record<string, number> = {};

    for (const problem of problems) {
      const level = problem.getLevel();
      const difficulty = problem.difficulty ?? 'Unknown';

      levels[level] = levels[level] + 1 || 1;
      difficulties[difficulty] = difficulties[difficulty] + 1 || 1;
      for (const tag of problem.tags) tags[tag] = tags[tag] + 1 || 1;
    }

    const sortedLevels = Object.fromEntries(Object.entries(levels).sort());
    const sortedDifficulties = Object.fromEntries(
      Object.entries(difficulties).sort()
    );
    const sortedTags = Object.fromEntries(
      Object.entries(tags).sort((a, b) => b[1] - a[1])
    );

    this.problems = problems;
    this.levels = sortedLevels;
    this.difficulties = sortedDifficulties;
    this.tags = sortedTags;
  }

  getStats() {
    const { levels, difficulties, tags } = this;
    return { levels, difficulties, tags };
  }

  getProblems() {
    return this.problems;
  }
}
