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
