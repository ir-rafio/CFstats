import { Problem } from '../api/codeforces/interfaces';
import prisma from '../prisma';
import { checkRecent } from '../utils';

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

export const fetchProblem = async (
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
