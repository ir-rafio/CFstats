import { createContestInfo } from '../contest/contest.services';
import { Problem } from '../interfaces';
import prisma from '../prisma';
import { checkRecent } from '../utils';

export const createProblem = async (
  problem: Problem
): Promise<Problem | null> => {
  try {
    await createContestInfo(problem.contest);
    const { contest, index, name, difficulty, tags } = problem;

    await prisma.problem.upsert({
      where: {
        contestId_index: {
          contestId: contest.id,
          index,
        },
      },
      create: {
        contestId: contest.id,
        index,
        name,
        difficulty,
        tags: {
          set: tags,
        },
      },
      update: {
        contestId: contest.id,
        index,
        name,
        difficulty,
        tags: {
          set: tags,
        },
        updatedAt: new Date(),
      },
    });

    return getProblem(contest.id, index);
  } catch (error) {
    console.error(error);
    throw new Error(
      `Failed to create problem in the database: ${problem.getKey()}`
    );
  }
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
    include: {
      contest: true,
    },
  });

  if (!dbProblem) return null;

  const { name, difficulty, tags } = dbProblem;
  const { phase, startTimeSeconds, type } = dbProblem.contest;
  const contestName = dbProblem.contest.name;
  const contest = {
    id: contestId,
    name: contestName,
    phase,
    startTimeSeconds: startTimeSeconds ?? undefined,
    type,
  };
  return new Problem(contest, index, name, tags, difficulty ?? undefined);
};

export const getRecentProblem = async (
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
    include: {
      contest: true,
    },
  });

  if (!dbProblem) return null;
  if (!checkRecent(dbProblem.updatedAt, 7200)) return null;

  const { name, difficulty, tags } = dbProblem;
  const { phase, startTimeSeconds, type } = dbProblem.contest;
  const contestName = dbProblem.contest.name;
  const contest = {
    id: contestId,
    name: contestName,
    phase,
    startTimeSeconds: startTimeSeconds ?? undefined,
    type,
  };
  return new Problem(contest, index, name, tags, difficulty ?? undefined);
};

export const getProblemMany = async (
  prismaFilter: object
): Promise<Problem[] | null> => {
  const dbProblems = await prisma.problem.findMany({
    where: prismaFilter,
    include: { contest: true },
  });
  if (!dbProblems) return null;

  const problems: Problem[] = dbProblems.map((dbProblem) => {
    const { contestId, index, name, difficulty, tags } = dbProblem;
    const { phase, startTimeSeconds, type } = dbProblem.contest;
    const contestName = dbProblem.contest.name;
    const contest = {
      id: contestId,
      name: contestName,
      phase,
      startTimeSeconds: startTimeSeconds ?? undefined,
      type,
    };
    return new Problem(contest, index, name, tags, difficulty ?? undefined);
  });

  return problems;
};

export const getRecentProblemMany = async (
  prismaFilter: object
): Promise<Problem[] | null> => {
  const dbProblems = await prisma.problem.findMany({
    where: prismaFilter,
    include: { contest: true },
  });
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
    const { phase, startTimeSeconds, type } = dbProblem.contest;
    const contestName = dbProblem.contest.name;
    const contest = {
      id: contestId,
      name: contestName,
      phase,
      startTimeSeconds: startTimeSeconds ?? undefined,
      type,
    };
    return new Problem(contest, index, name, tags, difficulty ?? undefined);
  });

  return problems;
};
