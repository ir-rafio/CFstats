import axios, { AxiosResponse } from 'axios';

const url = 'http://localhost:4000';

export interface UserSolutions {
  [problemKey: string]: {
    problem: Problem;
    submissionTime: number;
    contestFlag: boolean;
  };
}

export interface UserInfo {
  handle: string;
  name: string;
  country?: string;
  city?: string;
  organization?: string;
  rating: number;
  maxRating: number;
  registrationTimeSeconds: number;
  photoLink: string;
}

export class User {
  handle: string;
  name: string;
  country?: string;
  city?: string;
  organization?: string;
  rating: number;
  maxRating: number;
  registrationTimeSeconds: number;
  photoLink: string;
  solutions: UserSolutions;
  contests: Set<number>;

  constructor(
    handle: string,
    name: string,
    rating: number,
    maxRating: number,
    registrationTimeSeconds: number,
    photoLink: string,
    solutions: UserSolutions,
    contests: Set<number>,
    country?: string,
    city?: string,
    organization?: string
  ) {
    this.handle = handle;
    this.name = name;
    this.country = country;
    this.city = city;
    this.organization = organization;
    this.rating = rating;
    this.maxRating = maxRating;
    this.registrationTimeSeconds = registrationTimeSeconds;
    this.photoLink = photoLink;
    this.solutions = solutions;
    this.contests = contests;
  }

  getInfo(): UserInfo {
    const {
      handle,
      name,
      country,
      city,
      organization,
      rating,
      maxRating,
      registrationTimeSeconds,
      photoLink,
    } = this;
    return {
      handle,
      name,
      country,
      city,
      organization,
      rating,
      maxRating,
      registrationTimeSeconds,
      photoLink,
    };
  }
}

export class Problem {
  contestId: number;
  index: string;
  name: string;
  rating: number;
  tags: string[];

  constructor(
    contestId: number,
    index: string,
    name: string,
    rating: number,
    tags: string[]
  ) {
    this.contestId = contestId;
    this.index = index;
    this.name = name;
    this.rating = rating;
    this.tags = tags;
  }

  getKey(): string {
    return `${this.contestId}-${this.index}`;
  }
}

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
  startTimeSeconds?: number;
  rank: ContestRank[];
}

export enum CodeforcesRank {
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

export interface ParsedUser {
  handle: string;
  name: string;
  country?: string;
  city?: string;
  organization?: string;
  rating: number;
  maxRating: number;
  rank: CodeforcesRank;
  maxRank: CodeforcesRank;
  registrationTimeSeconds: number;
  photoLink: string;
  solveCount: number;
  contestCount: number;
  levels: Record<string, number>;
  difficulties: Record<string, number>;
  tags: Record<string, number>;
  solutions: UserSolutions;
  contests: Set<number>;
}

export const getUser = async (
  handle: string
): Promise<AxiosResponse<ParsedUser>> =>
  await axios.get(`${url}/user/${handle}`);

export const getProblem = async (
  key: string
): Promise<AxiosResponse<Problem>> => await axios.get(`${url}/problem/${key}`);

export const getContest = async (id: number): Promise<AxiosResponse<Contest>> =>
  await axios.get(`${url}/contest/${id}`);
