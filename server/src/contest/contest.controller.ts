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
import { ContestDetails, ContestInfo } from '../api/codeforces/interfaces';

const parseContest = (contest: ContestDetails): ContestDetails => {
  const { problems } = contest;
  problems.sort((a, b) => a.index.localeCompare(b.index));

  return { ...contest, problems };
};

export const getContest = async (id: number): Promise<ContestDetails> => {
  try {
    const existingContest = await getContestFromDb(id);
    if (existingContest) return parseContest(existingContest);

    const contestInfo = await getContestInfoFromApi(id);
    if (contestInfo.phase !== 'FINISHED')
      return parseContest({
        info: contestInfo,
        rank: [],
        problems: [],
      });

    const contest = await getContestFromApi(id);
    const createdContest = await createContest(contest);

    if (!createdContest) {
      console.error(`Failed to add contest ${contest.info.id} to the database`);
      return parseContest(contest);
    }

    return parseContest(createdContest);
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch the contest from the API.');
  }
};

export const getContestList = async (): Promise<ContestInfo[]> => {
  try {
    const existingContestList = await getContestMany({});
    if (existingContestList) return existingContestList;

    const contestList = await getContestListFromApi();
    let flag: boolean = true;

    const createdContestList: ContestInfo[] = [];
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
): Promise<ContestInfo[]> => {
  const existingContests = await getContestMany(prismaFilter);
  if (existingContests) return existingContests;

  const contestList = await getContestListFromApi();
  const createdContestList: ContestInfo[] = [];
  for (const contest of contestList) {
    const createdContest = await createContestInfo(contest);
    if (createdContest) createdContestList.push(createdContest);
    else console.error(`Failed to add contest ${contest.id} to Database`);
  }

  const filteredContests = await getContestMany(prismaFilter);
  return filteredContests ?? [];
};
