import { Problem } from './problem.interfaces';

export interface ContestRank {
  handle: string;
  position: number;
}

export interface ContestInfo {
  id: number;
  name: string;
  type: 'CF' | 'IOI' | 'ICPC';
  phase:
    | 'BEFORE'
    | 'CODING'
    | 'PENDING_SYSTEM_TEST'
    | 'SYSTEM_TEST'
    | 'FINISHED';
  startTimeSeconds?: number;
}

export interface ContestDetails {
  info: ContestInfo;
  problems: Problem[];
  rank: ContestRank[];
}
