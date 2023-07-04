import * as CfApi from '../api/codeforces';
// import { prisma } from '../prisma';

const parseKey = (key: string): { contestId: number; index: string } => {
  const [contestStr, index] = key.split('-');
  const contestId = parseInt(contestStr, 10);

  return { contestId, index };
};

export const getProblem = async (key: string): Promise<CfApi.Problem> => {
  const { contestId, index } = parseKey(key);

  // const existingProblem = await prisma.problem.findUnique({
  //   where: { key },
  // });

  // if (existingProblem) {
  //   return existingProblem;
  // }

  try {
    const problem = await CfApi.getProblem(contestId, index);

    // const createdProblem = await prisma.problem.create({
    //   data: {
    //     contestId: problem.contestId,
    //     index: problem.index,
    //     name: problem.name,
    //     rating: problem.rating,
    //     tags: problem.tags,
    //   },
    // });

    // return createdProblem;
    return problem;
  } catch (error) {
    throw new Error('Failed to fetch the problem from the API.');
  }
};

export const getProblemList = async (): Promise<CfApi.Problem[]> => {
  // const existingProblemList = await prisma.problem.findMany();

  // if (existingProblemList.length > 0) {
  //   return existingProblemList;
  // }

  try {
    const problemList = await CfApi.getProblemList();

    // const createdProblemList = await prisma.problem.createMany({
    //   data: problemList.map((problem) => ({
    //     contestId: problem.contestId,
    //     index: problem.index,
    //     name: problem.name,
    //     rating: problem.rating,
    //     tags: problem.tags,
    //   })),
    // });

    // return createdProblemList;
    return problemList;
  } catch (error) {
    throw new Error('Failed to fetch the problems from the API.');
  }
};
