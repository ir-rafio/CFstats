export class Problem {
  constructor(
    public contestId: number,
    public index: string,
    public name: string,
    public tags: string[],
    public difficulty?: number
  ) {}

  getKey(): string {
    return Problem.generateKey(this.contestId, this.index);
  }

  getLevel(): string {
    const { index } = this;

    return index && index[0].match(/[A-Za-z]/) ? index[0].toUpperCase() : '0';
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
