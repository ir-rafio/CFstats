import { ContestInfo } from './contest.interfaces';
import { Problem } from './problem.interfaces';

export interface UserSolution {
  problem: Problem;
  submissionTimeSeconds: number;
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
  contests: ContestInfo[];
}

enum CodeforcesRank {
  NEWBIE = 'Newbie',
  PUPIL = 'Pupil',
  SPECIALIST = 'Specialist',
  EXPERT = 'Expert',
  CANDIDATE_MASTER = 'Candidate Master',
  MASTER = 'Master',
  INTERNATIONAL_MASTER = 'International Master',
  GRANDMASTER = 'Grandmaster',
  INTERNATIONAL_GRANDMASTER = 'International Grandmaster',
  LEGENDARY_GRANDMASTER = 'Legendary Grandmaster',
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
