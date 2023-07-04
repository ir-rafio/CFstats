import * as dataFetcher from './data-fetcher';
import {
  CfContest,
  CfContestStandings,
  CfProblem,
  CfProblemSet,
  CfRankListRow,
  CfSubmission,
  CfUser,
} from './interfaces';

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

const parseName = (
  firstName: string | undefined,
  lastName: string | undefined
): string => {
  const normalizedFirstName = firstName || '';
  const normalizedLastName = lastName || '';

  const name =
    normalizedFirstName && normalizedLastName
      ? normalizedFirstName + ' ' + normalizedLastName
      : normalizedFirstName
      ? normalizedFirstName
      : normalizedLastName
      ? normalizedLastName
      : '';

  return name;
};

const parseProblem = (problem: CfProblem): Problem => {
  if (!problem.contestId)
    throw new Error('Invalid problem: contest id is missing!');

  const { contestId, index, name, tags } = problem;
  const rating = problem.rating || 0;
  return new Problem(contestId, index, name, rating, tags);
};

const parseContest = (
  contest: CfContest,
  rankingRows: CfRankListRow[]
): Contest => {
  let rank: ContestRank[] = [];

  for (const row of rankingRows) {
    const { party } = row;
    const { members } = row.party;
    const position = row.rank;

    for (const member of members) {
      const { handle } = member;
      rank.push({ handle, position });
    }
  }

  const { id, name, type, phase, startTimeSeconds } = contest;
  return { id, name, type, phase, startTimeSeconds, rank };
};

const getUserRecords = async (
  handle: string
): Promise<{ solutions: UserSolutions; contests: Set<number> }> => {
  try {
    const submissions: CfSubmission[] = await dataFetcher.getCfUserSubmissions(
      handle
    );
    const solutions: UserSolutions = {};
    const contests: Set<number> = new Set();

    for (const submission of submissions) {
      const problem: CfProblem = submission.problem;
      const contestFlag: boolean =
        submission.author.participantType === 'CONTESTANT';

      if ('contestId' in problem) {
        const contestId = problem.contestId;
        const problemKey = `${contestId}-${problem.index}`;
        if (submission.verdict === 'OK') {
          solutions[problemKey] = {
            problem: parseProblem(problem),
            submissionTime: submission.creationTimeSeconds,
            contestFlag,
          };
        }
      }

      if (contestFlag && problem.contestId) contests.add(problem.contestId);
    }

    return {
      solutions,
      contests: contests,
    };
  } catch (error) {
    console.error('An error occurred:', error);
    throw new Error('Failed to get user records');
  }
};

export const getUser = async (handle: string): Promise<User> => {
  try {
    const cfUser: CfUser = await dataFetcher.getCfUser(handle);
    const {
      firstName,
      lastName,
      country,
      city,
      organization,
      rating,
      maxRating,
      registrationTimeSeconds,
    } = cfUser;
    const name = parseName(firstName, lastName);
    const photoLink = cfUser.titlePhoto;
    const { solutions, contests } = await getUserRecords(handle);

    return new User(
      handle,
      name,
      rating,
      maxRating,
      registrationTimeSeconds,
      photoLink,
      solutions,
      contests,
      country,
      city,
      organization
    );
  } catch (error) {
    console.error('An error occurred:', error);
    throw new Error('Failed to get user data');
  }
};

export const getUserList = async (
  isActiveOnly: boolean,
  shouldIncludeRetired: boolean
): Promise<User[]> => {
  try {
    const cfUsers: CfUser[] = await dataFetcher.getCfUserList(
      isActiveOnly,
      shouldIncludeRetired
    );

    let users: User[] = [];
    for (const cfUser of cfUsers) {
      const {
        handle,
        firstName,
        lastName,
        country,
        city,
        organization,
        rating,
        maxRating,
        registrationTimeSeconds,
      } = cfUser;
      const name = parseName(firstName, lastName);
      const photoLink = cfUser.titlePhoto;
      const { solutions, contests } = await getUserRecords(handle);

      users.push(
        new User(
          handle,
          name,
          rating,
          maxRating,
          registrationTimeSeconds,
          photoLink,
          solutions,
          contests,
          country,
          city,
          organization
        )
      );
    }

    return users;
  } catch (error) {
    console.error('An error occurred:', error);
    throw new Error('Failed to get user data');
  }
};

export const getProblem = async (
  contestId: number,
  index: string
): Promise<Problem> => {
  try {
    const cfContestStandings: CfContestStandings =
      await dataFetcher.getContestStandings(contestId, 1);
    const cfContestProblems: CfProblem[] = cfContestStandings['problems'];

    for (const problem of cfContestProblems)
      if (problem.index === index) return parseProblem(problem);
    throw new Error('Problem not found!');
  } catch (error) {
    console.error('An error occurred:', error);
    throw new Error('Failed to get problem data');
  }
};

export const getProblemList = async (): Promise<Problem[]> => {
  try {
    const cfProblemSet: CfProblemSet = await dataFetcher.getCfProblemSet();
    const cfProblems: CfProblem[] = cfProblemSet['problems'];

    let problems: Problem[] = [];
    for (const problem of cfProblems) problems.push(parseProblem(problem));

    return problems;
  } catch (error) {
    console.error('An error occurred:', error);
    throw new Error('Failed to get problem data');
  }
};

export const getContest = async (contestId: number): Promise<Contest> => {
  try {
    const cfContestStandings: CfContestStandings =
      await dataFetcher.getContestStandings(contestId, 5);
    const cfContest: CfContest = cfContestStandings['contest'];
    const rankingRows: CfRankListRow[] = cfContestStandings['rows'];
    return parseContest(cfContest, rankingRows);
  } catch (error) {
    console.error('An error occurred:', error);
    throw new Error('Failed to get contest data');
  }
};

export const getContestList = async (): Promise<Contest[]> => {
  try {
    const cfContests: CfContest[] = await dataFetcher.getCfContestList();
    let contests: Contest[] = [];
    for (const cfContest of cfContests)
      contests.push(await getContest(cfContest.id));
    return contests;
  } catch (error) {
    console.error('An error occurred:', error);
    throw new Error('Failed to get contest data');
  }
};
