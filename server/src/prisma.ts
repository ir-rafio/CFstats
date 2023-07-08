import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();
export default prisma;

import {
  Contest,
  ContestDetails,
  ContestRank,
  Problem,
  User,
  UserSolution,
} from './api/codeforces/middleware/interfaces';

const checkRecent = (time: Date, threshold: number): boolean => {
  const currentTime = new Date();
  const comparisonTime = currentTime.getTime() - threshold * 1000;

  return time.getTime() >= comparisonTime;
};

export const createUser = async (user: User): Promise<User | null> => {
  try {
    await prisma.user.upsert({
      where: { handle: user.handle },
      create: {
        handle: user.handle,
        name: user.name,
        country: user.country,
        city: user.city,
        organization: user.organization,
        rating: user.rating,
        maxRating: user.maxRating,
        registrationTimeSeconds: user.registrationTimeSeconds,
        photoLink: user.photoLink,
      },
      update: { updatedAt: new Date() },
    });

    await prisma.solution.deleteMany({
      where: { userHandle: user.handle },
    });

    await prisma.participation.deleteMany({
      where: { userHandle: user.handle },
    });

    await prisma.solution.createMany({
      data: Object.entries(user.solutions).map(([problemKey, solution]) => ({
        problemContestId: solution.problem.contestId,
        problemIndex: solution.problem.index,
        submissionTime: solution.submissionTime,
        contestFlag: solution.contestFlag,
        userHandle: user.handle,
      })),
    });

    await prisma.participation.createMany({
      data: Array.from(user.contests).map((contestId) => ({
        userHandle: user.handle,
        contestId,
      })),
    });

    return await getUser(user.handle);
  } catch (error) {
    console.error(error);
    throw new Error('Failed to create user in the database.');
  }
};

export const getUser = async (handle: string): Promise<User | null> => {
  const dbUser = await prisma.user.findUnique({
    where: { handle },
    include: {
      solutions: true,
      contests: true,
    },
  });

  if (!dbUser) return null;
  if (!checkRecent(dbUser.updatedAt, 7200)) null;

  const mappedContests: number[] = dbUser.contests.map(
    (contest) => contest.contestId
  );
  const mappedSolutions: UserSolution[] = [];

  for (const solution of dbUser.solutions) {
    const { submissionTime, contestFlag } = solution;
    const contestId = solution.problemContestId;
    const index = solution.problemIndex;

    const problem = await fetchProblem(contestId, index);
    if (!problem) continue;

    mappedSolutions.push({ problem, submissionTime, contestFlag });
  }

  return {
    ...dbUser,
    country: dbUser.country ?? undefined,
    city: dbUser.city ?? undefined,
    organization: dbUser.organization ?? undefined,
    solutions: mappedSolutions,
    contests: mappedContests,
  };
};

export const getUserMany = async (
  prismaFilter: object
): Promise<User[] | null> => {
  const dbUsers = await prisma.user.findMany({ where: prismaFilter });
  if (!dbUsers) return null;

  const result = await prisma.user.aggregate({
    where: prismaFilter,
    _min: { updatedAt: true },
  });
  const updatedAt = result._min.updatedAt;
  if (!updatedAt) return null;
  if (!checkRecent(updatedAt, 7200)) return null;

  const userPromises: Promise<User | null>[] = dbUsers.map((dbUser) =>
    getUser(dbUser.handle)
  );
  const users = await Promise.all(userPromises);

  return users.filter((user) => user !== null) as User[];
};

export const createProblem = async (
  problem: Problem
): Promise<Problem | null> => {
  const { contestId, index, name, difficulty, tags } = problem;

  const dbProblem = await prisma.problem.upsert({
    where: {
      contestId_index: {
        contestId,
        index,
      },
    },
    create: {
      contestId,
      index,
      name,
      difficulty,
      tags: {
        set: tags,
      },
    },
    update: { updatedAt: new Date() },
  });

  return dbProblem ? problem : null;
};

const fetchProblem = async (
  contestId: number,
  index: string
): Promise<Problem | null> => {
  const dbProblem = await prisma.problem.findUnique({
    where: {
      contestId_index: {
        contestId,
        index,
      },
    },
  });

  if (!dbProblem) return null;

  const { name, difficulty, tags } = dbProblem;
  return new Problem(contestId, index, name, tags, difficulty ?? undefined);
};

export const getProblem = async (
  contestId: number,
  index: string
): Promise<Problem | null> => {
  const dbProblem = await prisma.problem.findUnique({
    where: {
      contestId_index: {
        contestId,
        index,
      },
    },
  });

  if (!dbProblem) return null;
  if (!checkRecent(dbProblem.updatedAt, 7200)) return null;

  const { name, difficulty, tags } = dbProblem;
  const problem = new Problem(
    contestId,
    index,
    name,
    tags,
    difficulty ?? undefined
  );

  if (!checkRecent(dbProblem.updatedAt, 7200)) return createProblem(problem);
  return problem;
};

export const getProblemMany = async (
  prismaFilter: object
): Promise<Problem[] | null> => {
  const dbProblems = await prisma.problem.findMany({ where: prismaFilter });
  if (!dbProblems) return null;

  const result = await prisma.problem.aggregate({
    where: prismaFilter,
    _min: { updatedAt: true },
  });
  const updatedAt = result._min.updatedAt;
  if (!updatedAt) return null;
  if (!checkRecent(updatedAt, 7200)) return null;

  const problems: Problem[] = dbProblems.map((dbProblem) => {
    const { contestId, index, name, difficulty, tags } = dbProblem;
    return new Problem(contestId, index, name, tags, difficulty ?? undefined);
  });

  return problems;
};

export const createContest = async (
  contest: ContestDetails
): Promise<ContestDetails | null> => {
  const { info, rank } = contest;

  const dbContest = await prisma.contest.upsert({
    where: { id: info.id },
    create: {
      id: info.id,
      name: info.name,
      type: info.type,
      phase: info.phase,
      startTimeSeconds: info.startTimeSeconds,
    },
    update: { updatedAt: new Date() },
  });

  await prisma.contestRank.deleteMany({ where: { contestId: info.id } });

  await prisma.contestRank.createMany({
    data: rank.map((contestRank) => ({
      contestId: dbContest.id,
      position: contestRank.position,
      userHandle: contestRank.handle,
    })),
  });

  return getContest(dbContest.id);
};

export const createContestInfo = async (
  contest: Contest
): Promise<Contest | null> => {
  const dbContest = await prisma.contest.upsert({
    where: { id: contest.id },
    create: {
      id: contest.id,
      name: contest.name,
      type: contest.type,
      phase: contest.phase,
      startTimeSeconds: contest.startTimeSeconds,
    },
    update: { updatedAt: new Date() },
  });

  return dbContest ? contest : null;
};

export const getContest = async (
  id: number
): Promise<ContestDetails | null> => {
  const dbContest = await prisma.contest.findUnique({
    where: { id },
    include: { ranks: true },
  });

  if (!dbContest) return null;
  if (!checkRecent(dbContest.updatedAt, 7200)) return null;

  const { name, type, phase, startTimeSeconds, ranks } = dbContest;
  const contest: Contest = {
    id,
    name,
    type,
    phase,
    startTimeSeconds: startTimeSeconds ?? undefined,
  };

  const contestRank: ContestRank[] = ranks.map((rank) => ({
    handle: rank.userHandle,
    position: rank.position,
  }));

  return {
    info: contest,
    rank: contestRank,
  };
};

export const getContestMany = async (
  prismaFilter: object
): Promise<Contest[] | null> => {
  const dbContests = await prisma.contest.findMany({ where: prismaFilter });
  if (!dbContests) return null;

  const result = await prisma.contest.aggregate({
    where: prismaFilter,
    _min: { updatedAt: true },
  });
  const updatedAt = result._min.updatedAt;
  if (!updatedAt) return null;
  if (!checkRecent(updatedAt, 7200)) return null;

  const contests: Contest[] = dbContests.map((dbContest) => {
    const { id, name, type, phase, startTimeSeconds } = dbContest;
    return {
      id,
      name,
      type,
      phase,
      startTimeSeconds: startTimeSeconds ?? undefined,
    };
  });

  return contests;
};
