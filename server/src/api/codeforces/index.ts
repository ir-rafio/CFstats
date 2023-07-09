import {
  getCfContestList,
  getCfProblemSet,
  getCfUser,
  getCfUserList,
  getCfUserSubmissions,
  getContestStandings,
} from './middleware';

import {
  CfContest,
  CfContestStandings,
  CfProblem,
  CfProblemSet,
  CfRankListRow,
  CfSubmission,
  CfUser,
} from './middleware/interfaces';

import {
  Contest,
  ContestDetails,
  ContestRank,
  Problem,
  User,
  UserSolution,
} from './interfaces';

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

const getUserRecords = async (
  handle: string
): Promise<{ solutions: UserSolution[]; contests: Contest[] }> => {
  try {
    const submissions: CfSubmission[] = await getCfUserSubmissions(handle);
    submissions.sort((a, b) => b.creationTimeSeconds - a.creationTimeSeconds);

    const solutionSet: Record<string, UserSolution> = {};
    const contestSet: Set<number> = new Set();
    const cfContests: CfContest[] = await getCfContestList();

    for (const submission of submissions) {
      const problem: CfProblem = submission.problem;

      if (submission.verdict !== 'OK') continue;
      if (!problem.contestId) continue;

      const contestId = problem.contestId;
      const problemKey = `${contestId}-${problem.index}`;
      const contestFlag: boolean =
        submission.author.participantType === 'CONTESTANT';

      const solution: UserSolution = {
        problem: parseProblem(problem),
        submissionTime: submission.creationTimeSeconds,
        contestFlag,
      };

      solutionSet[problemKey] = solution;

      if (contestFlag && problem.contestId) contestSet.add(problem.contestId);
    }

    const solutions: UserSolution[] = Object.values(solutionSet);
    const contests: Contest[] = cfContests
      .filter((cfContest) => contestSet.has(cfContest.id))
      .map((cfContest) => parseContest(cfContest));

    return {
      solutions,
      contests,
    };
  } catch (error) {
    console.error('An error occurred:', error);
    throw new Error('Failed to get user records');
  }
};

export const getUser = async (handle: string): Promise<User> => {
  try {
    const cfUser: CfUser = await getCfUser(handle);
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

    return {
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
      organization,
    };
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
    const cfUsers: CfUser[] = await getCfUserList(
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

      users.push({
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
        organization,
      });
    }

    return users;
  } catch (error) {
    console.error('An error occurred:', error);
    throw new Error('Failed to get user data');
  }
};

const parseProblem = (problem: CfProblem): Problem => {
  if (!problem.contestId)
    throw new Error('Invalid problem: contest id is missing!');

  const { contestId, index, name, tags, rating } = problem;
  return new Problem(contestId, index, name, tags, rating);
};

export const getProblem = async (
  contestId: number,
  index: string
): Promise<Problem> => {
  try {
    const cfContestStandings: CfContestStandings = await getContestStandings(
      contestId,
      1
    );
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
    const cfProblemSet: CfProblemSet = await getCfProblemSet();
    const cfProblems: CfProblem[] = cfProblemSet['problems'];

    let problems: Problem[] = [];
    for (const problem of cfProblems) problems.push(parseProblem(problem));

    return problems;
  } catch (error) {
    console.error('An error occurred:', error);
    throw new Error('Failed to get problem data');
  }
};

const parseContest = (contest: CfContest): Contest => {
  const { id, name, type, phase, startTimeSeconds } = contest;
  return { id, name, type, phase, startTime: startTimeSeconds };
};

const parseContestRank = (rankingRows: CfRankListRow[]) => {
  let rank: ContestRank[] = [];

  for (const row of rankingRows) {
    const { party } = row;
    const { members } = party;
    const position = row.rank;

    for (const member of members) {
      const { handle } = member;
      rank.push({ handle, position });
    }
  }

  return rank;
};

export const getContest = async (
  contestId: number
): Promise<ContestDetails> => {
  try {
    const cfContestStandings: CfContestStandings = await getContestStandings(
      contestId,
      5
    );

    const cfContest: CfContest = cfContestStandings['contest'];
    const rankingRows: CfRankListRow[] = cfContestStandings['rows'];

    const problemList: Problem[] = await getProblemList();
    const problems = problemList.filter(
      (problem) => problem.contestId === cfContest.id
    );

    return {
      info: parseContest(cfContest),
      rank: parseContestRank(rankingRows),
      problems,
    };
  } catch (error) {
    console.error('An error occurred:', error);
    throw new Error('Failed to get contest data');
  }
};

export const getContestList = async (): Promise<Contest[]> => {
  try {
    const cfContests: CfContest[] = await getCfContestList();
    let contests: Contest[] = [];
    for (const cfContest of cfContests) contests.push(parseContest(cfContest));
    return contests;
  } catch (error) {
    console.error('An error occurred:', error);
    throw new Error('Failed to get contest data');
  }
};

export const getContestInfo = async (contestId: number): Promise<Contest> => {
  try {
    const cfContests: CfContest[] = await getCfContestList();
    for (const cfContest of cfContests)
      if (cfContest.id === contestId) return cfContest;
    throw new Error('Failed to fetch the contest info');
  } catch (error) {
    console.error('An error occurred: ', error);
    throw new Error('Failed to get contest data');
  }
};
