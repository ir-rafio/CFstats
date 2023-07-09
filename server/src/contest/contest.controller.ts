import {
  createContest,
  createContestInfo,
  getContest as getContestFromDb,
  getContestMany,
} from './contest.services';

import {
  getContest as getContestFromApi,
  getContestInfo as getContestInfoFromApi,
  getContestList as getContestListFromApi,
} from '../api/codeforces';
import { Contest, ContestDetails } from '../api/codeforces/interfaces';

export const getContest = async (id: number): Promise<ContestDetails> => {
  try {
    const existingContest = await getContestFromDb(id);
    if (
      existingContest &&
      (existingContest.info.phase !== 'FINISHED' ||
        (existingContest.problems.length > 0 &&
          existingContest.rank.length > 0))
    )
      return existingContest;

    const contestInfo = await getContestInfoFromApi(id);
    if (contestInfo.phase !== 'FINISHED')
      return {
        info: contestInfo,
        rank: [],
        problems: [],
      };

    const contest = await getContestFromApi(id);
    const createdContest = await createContest(contest);

    if (!createdContest) {
      console.error(`Failed to add contest ${contest.info.id} to the database`);
      return contest;
    }

    return createdContest;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch the contest from the API.');
  }
};

export const getContestList = async (): Promise<Contest[]> => {
  try {
    const existingContestList = await getContestMany({});
    if (existingContestList) return existingContestList;

    const contestList = await getContestListFromApi();
    let flag: boolean = true;

    const createdContestList: Contest[] = [];
    for (const contest of contestList) {
      const createdContest = await createContestInfo(contest);
      if (createdContest) createdContestList.push(createdContest);
      else {
        console.error(`Failed to add contest ${contest.id} to Database`);
        flag = false;
      }
    }

    return flag ? createdContestList : contestList;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch contests from the API/Database.');
  }
};

export const getFilteredContests = async (
  prismaFilter: object
): Promise<Contest[]> => {
  const existingContests = await getContestMany(prismaFilter);
  if (existingContests) return existingContests;

  const contestList = await getContestListFromApi();
  const createdContestList: Contest[] = [];
  for (const contest of contestList) {
    const createdContest = await createContestInfo(contest);
    if (createdContest) createdContestList.push(createdContest);
    else console.error(`Failed to add contest ${contest.id} to Database`);
  }

  const filteredContests = await getContestMany(prismaFilter);
  return filteredContests ?? [];
};
