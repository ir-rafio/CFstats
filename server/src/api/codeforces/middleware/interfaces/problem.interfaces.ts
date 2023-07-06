export class Problem {
  constructor(
    public contestId: number,
    public index: string,
    public name: string,
    public difficulty: number,
    public tags: string[]
  ) {}

  getKey(): string {
    return Problem.generateKey(this.contestId, this.index);
  }

  static generateKey = (contestId: number, index: string): string => {
    return `${contestId}-${index}`;
  };

  static parseKey = (key: string): { contestId: number; index: string } => {
    const [contestStr, index] = key.split('-');
    const contestId = Number(contestStr);

    return { contestId, index };
  };
}
