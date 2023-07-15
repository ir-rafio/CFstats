import {
  getProblem as getProblemFromApi,
  getProblemList as getProblemListFromApi,
} from '../api/codeforces';
import { Problem, Problemset } from '../api/codeforces/interfaces';
import {
  createProblem,
  getProblemMany,
  getRecentProblem as getRecentProblemFromDb,
  getRecentProblemMany,
} from './problem.services';

export const getProblem = async (key: string): Promise<Problem> => {
  try {
    const { contestId, index } = Problem.parseKey(key);

    const existingProblem = await getRecentProblemFromDb(contestId, index);
    if (existingProblem) return existingProblem;

    const problem = await getProblemFromApi(contestId, index);
    const createdProblem = await createProblem(problem);
    if (!createdProblem) {
      console.error(`Failed to add problem ${problem.getKey()} to Database`);
      return problem;
    }

    return createdProblem;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch problem from the API/Database.');
  }
};

export const getFilteredProblems = async (
  prismaFilter: object
): Promise<Problemset> => {
  const existingProblems = await getRecentProblemMany(prismaFilter);
  if (existingProblems) return new Problemset(existingProblems);

  const problemList = await getProblemListFromApi();
  const createdProblemList: Problem[] = [];
  for (const problem of problemList) {
    const createdProblem = await createProblem(problem);
    if (createdProblem) createdProblemList.push(createdProblem);
    else console.error(`Failed to add Problem ${problem.getKey()} to Database`);
  }

  const filteredProblems = await getProblemMany(prismaFilter);
  return new Problemset(filteredProblems ?? []);
};
