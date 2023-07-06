import { Problem } from './problem.interfaces';

export interface UserSolution {
  problem: Problem;
  submissionTime: number;
  contestFlag: boolean;
}

export interface User {
  handle: string;
  name: string;
  country?: string;
  city?: string;
  organization?: string;
  rating: number;
  maxRating: number;
  registrationTimeSeconds: number;
  photoLink: string;
  solutions: UserSolution[];
  contests: number[];
}

enum CodeforcesRank {
  Newbie = 'Newbie',
  Pupil = 'Pupil',
  Specialist = 'Specialist',
  Expert = 'Expert',
  CandidateMaster = 'Candidate Master',
  Master = 'Master',
  InternationalMaster = 'International Master',
  Grandmaster = 'Grandmaster',
  InternationalGrandmaster = 'International Grandmaster',
  LegendaryGrandmaster = 'Legendary Grandmaster',
}

export interface ParsedUser extends User {
  rank: CodeforcesRank;
  maxRank: CodeforcesRank;
  solveCount: number;
  contestCount: number;
  levels: Record<string, number>;
  difficulties: Record<string, number>;
  tags: Record<string, number>;
}
