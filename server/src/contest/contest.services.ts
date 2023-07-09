import prisma from '../prisma';
import { checkRecent } from '../utils';

import {
  Contest,
  ContestDetails,
  ContestRank,
} from '../api/codeforces/interfaces';

import { Problem } from '../api/codeforces/interfaces/problem.interfaces';
import { createProblem } from '../problem/problem.services';

export const createContest = async (
  contest: ContestDetails
): Promise<ContestDetails | null> => {
  try {
    const { info, rank, problems } = contest;

    const dbContest = await prisma.contest.upsert({
      where: { id: info.id },
      create: {
        id: info.id,
        name: info.name,
        type: info.type,
        phase: info.phase,
        startTimeSeconds: info.startTimeSeconds,
      },
      update: {
        id: info.id,
        name: info.name,
        type: info.type,
        phase: info.phase,
        startTimeSeconds: info.startTimeSeconds,
        updatedAt: new Date(),
      },
    });

    await prisma.contestRank.deleteMany({ where: { contestId: info.id } });
    await prisma.contestRank.createMany({
      data: rank.map((contestRank) => ({
        contestId: dbContest.id,
        position: contestRank.position,
        userHandle: contestRank.handle,
      })),
    });

    problems.map(async (problem) => await createProblem(problem));

    return getContest(dbContest.id);
  } catch (error) {
    console.error(error);
    throw new Error(
      `Failed to create contest in the database: ${contest.info.id}`
    );
  }
};

export const createContestInfo = async (
  contest: Contest
): Promise<Contest | null> => {
  try {
    const dbContest = await prisma.contest.upsert({
      where: { id: contest.id },
      create: {
        id: contest.id,
        name: contest.name,
        type: contest.type,
        phase: contest.phase,
        startTimeSeconds: contest.startTimeSeconds,
      },
      update: {
        id: contest.id,
        name: contest.name,
        type: contest.type,
        phase: contest.phase,
        startTimeSeconds: contest.startTimeSeconds,
        updatedAt: new Date(),
      },
    });

    return dbContest ? contest : null;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to create contest in the database: ${contest.id}`);
  }
};

export const getContest = async (
  id: number
): Promise<ContestDetails | null> => {
  const dbContest = await prisma.contest.findUnique({
    where: { id },
    include: { ranks: true, problems: true },
  });

  if (!dbContest) return null;
  if (!checkRecent(dbContest.updatedAt, 7200)) return null;

  const { name, type, phase, startTimeSeconds, ranks, problems } = dbContest;
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
