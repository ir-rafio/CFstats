import prisma from '../prisma';
import { checkRecent } from '../utils';

import { ContestDetails, ContestInfo, ContestRank } from '../interfaces';

import { Problem } from '../interfaces';
import { createProblem } from '../problem/problem.services';

export const createContestDetails = async (
  contest: ContestDetails
): Promise<ContestDetails | null> => {
  try {
    const { info, rank, problems } = contest;

    await prisma.contest.upsert({
      where: { id: info.id },
      create: {
        id: info.id,
        name: info.name,
        type: info.type,
        phase: info.phase,
        startTimeSeconds: info.startTimeSeconds,
        hasDetails: true,
      },
      update: {
        id: info.id,
        name: info.name,
        type: info.type,
        phase: info.phase,
        startTimeSeconds: info.startTimeSeconds,
        hasDetails: true,
        updatedAt: new Date(),
      },
    });

    await prisma.contestRank.deleteMany({ where: { contestId: info.id } });
    await prisma.contestRank.createMany({
      data: rank.map((contestRank) => ({
        contestId: info.id,
        position: contestRank.position,
        userHandle: contestRank.handle,
      })),
    });

    problems.map(async (problem) => await createProblem(problem));

    return getContestDetails(info.id);
  } catch (error) {
    console.error(error);
    throw new Error(
      `Failed to create contest in the database: ${contest.info.id}`
    );
  }
};

export const createContestInfo = async (
  contest: ContestInfo
): Promise<ContestInfo | null> => {
  try {
    const { id, name, type, phase, startTimeSeconds } = contest;

    await prisma.contest.upsert({
      where: { id },
      create: {
        id,
        name,
        type,
        phase,
        startTimeSeconds,
        hasDetails: false,
      },
      update: {
        id,
        name,
        type,
        phase,
        startTimeSeconds,
        hasDetails: false,
        updatedAt: new Date(),
      },
    });

    return getContestInfo(id);
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to create contest in the database: ${contest.id}`);
  }
};

export const getContestDetails = async (
  id: number
): Promise<ContestDetails | null> => {
  const dbContest = await prisma.contest.findUnique({
    where: { id },
    include: { ranks: true, problems: true },
  });

  if (!dbContest) return null;
  // TODO: Figure out why this is false for newly created contests.
  console.log(dbContest.hasDetails);
  if (!dbContest.hasDetails) return null;

  const { name, type, phase, startTimeSeconds, ranks, problems } = dbContest;
  const contest: ContestInfo = {
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

  const contestProblems: Problem[] = problems.map((problem) => {
    const { index, name, tags, difficulty } = problem;
    return new Problem(contest, index, name, tags, difficulty ?? undefined);
  });

  return {
    info: contest,
    rank: contestRank,
    problems: contestProblems,
  };
};

export const getRecentContestDetails = async (
  id: number
): Promise<ContestDetails | null> => {
  const dbContest = await prisma.contest.findUnique({
    where: { id },
    include: { ranks: true, problems: true },
  });

  if (!dbContest) return null;
  if (!dbContest.hasDetails) return null;
  if (!checkRecent(dbContest.updatedAt, 7200)) return null;

  const { name, type, phase, startTimeSeconds, ranks, problems } = dbContest;
  const contest: ContestInfo = {
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

  const contestProblems: Problem[] = problems.map((problem) => {
    const { index, name, tags, difficulty } = problem;
    return new Problem(contest, index, name, tags, difficulty ?? undefined);
  });

  return {
    info: contest,
    rank: contestRank,
    problems: contestProblems,
  };
};

export const getContestInfo = async (
  id: number
): Promise<ContestInfo | null> => {
  const dbContest = await prisma.contest.findUnique({
    where: { id },
  });

  if (!dbContest) return null;

  const { name, type, phase, startTimeSeconds } = dbContest;
  return {
    id,
    name,
    type,
    phase,
    startTimeSeconds: startTimeSeconds ?? undefined,
  };
};

export const getRecentContestInfo = async (
  id: number
): Promise<ContestInfo | null> => {
  const dbContest = await prisma.contest.findUnique({
    where: { id },
  });

  if (!dbContest) return null;
  if (!checkRecent(dbContest.updatedAt, 7200)) return null;

  const { name, type, phase, startTimeSeconds } = dbContest;
  return {
    id,
    name,
    type,
    phase,
    startTimeSeconds: startTimeSeconds ?? undefined,
  };
};

export const getContestMany = async (
  prismaFilter: object
): Promise<ContestInfo[] | null> => {
  const dbContests = await prisma.contest.findMany({ where: prismaFilter });
  if (!dbContests) return null;

  const contests: ContestInfo[] = dbContests.map((dbContest) => {
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

export const getRecentContestMany = async (
  prismaFilter: object
): Promise<ContestInfo[] | null> => {
  const dbContests = await prisma.contest.findMany({ where: prismaFilter });
  if (!dbContests) return null;

  const result = await prisma.contest.aggregate({
    where: prismaFilter,
    _min: { updatedAt: true },
  });
  const updatedAt = result._min.updatedAt;
  if (!updatedAt) return null;
  if (!checkRecent(updatedAt, 7200)) return null;

  const contests: ContestInfo[] = dbContests.map((dbContest) => {
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
