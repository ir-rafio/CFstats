import {
  createContestDetails,
  createContestInfo,
  getContestMany,
  getRecentContestDetails as getRecentContestFromDb,
  getRecentContestMany,
} from './contest.services';

import {
  getContest as getContestFromApi,
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
    const existingContest = await getRecentContestFromDb(id);
    if (existingContest) return parseContest(existingContest);

    const contest = await getContestFromApi(id);
    const createdContest = await createContestDetails(contest);
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

export const getFilteredContests = async (
  prismaFilter: object
): Promise<ContestInfo[]> => {
  const existingContests = await getRecentContestMany(prismaFilter);
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
