import { Problem } from './problem.interfaces';

export interface ContestRank {
  handle: string;
  position: number;
}

export interface Contest {
  id: number;
  name: string;
  type: 'CF' | 'IOI' | 'ICPC';
  phase:
    | 'BEFORE'
    | 'CODING'
    | 'PENDING_SYSTEM_TEST'
    | 'SYSTEM_TEST'
    | 'FINISHED';
  startTime?: number;
}

export interface ContestDetails {
  info: Contest;
  problems: Problem[];
  rank: ContestRank[];
}
