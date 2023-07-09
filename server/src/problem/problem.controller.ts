import {
  getProblem as getProblemFromApi,
  getProblemList as getProblemListFromApi,
} from '../api/codeforces/middleware';
import { Problem } from '../api/codeforces/middleware/interfaces';
import {
  createProblem,
  getProblem as getProblemFromDb,
  getProblemMany,
} from './problem.services';

export const getProblem = async (key: string): Promise<Problem> => {
  try {
    const { contestId, index } = Problem.parseKey(key);

    const existingProblem = await getProblemFromDb(contestId, index);
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

export const getProblemList = async (): Promise<Problem[]> => {
  try {
    const existingProblemList = await getProblemMany({});
    if (existingProblemList) return existingProblemList;

    const problemList = await getProblemListFromApi();
    let flag: boolean = true;

    const createdProblemList: Problem[] = [];
    for (const problem of problemList) {
      const createdProblem = await createProblem(problem);
      if (createdProblem) createdProblemList.push(createdProblem);
      else {
        console.error(`Failed to add Problem ${problem.getKey()} to Database`);
        flag = false;
      }
    }

    return flag ? createdProblemList : problemList;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch problems from the API/Database.');
  }
};
