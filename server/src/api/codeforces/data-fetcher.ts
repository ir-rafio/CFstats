import axios from 'axios';
import {
  CfContest,
  CfContestStandings,
  CfProblemSet,
  CfResponse,
  CfSubmission,
  CfUser,
} from './interfaces';

function parseCfResponse<T>(cfResponse: CfResponse<T>): T {
  if (cfResponse.status === 'OK') {
    if (cfResponse.result) {
      return cfResponse.result;
    } else {
      throw new Error('Invalid response: result is missing!');
    }
  } else if (cfResponse.comment) {
    throw new Error(`Invalid response: ${cfResponse.comment}!`);
  } else {
    throw new Error('Invalid response!');
  }
}

export const getCfUser = async (handle: string): Promise<CfUser> => {
  try {
    const response = await axios.get<CfResponse<CfUser[]>>(
      `https://codeforces.com/api/user.info?handles=${handle}`
    );
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return parseCfResponse(response.data)[0];
  } catch (error) {
    console.error('An error occurred:', error);
    throw new Error('Failed to fetch user information');
  }
};

export const getCfUserSubmissions = async (
  handle: string
): Promise<CfSubmission[]> => {
  try {
    const response = await axios.get<CfResponse<CfSubmission[]>>(
      `https://codeforces.com/api/user.status?handle=${handle}`
    );
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return parseCfResponse(response.data);
  } catch (error) {
    console.error('An error occurred:', error);
    throw new Error('Failed to fetch user submissions');
  }
};

export const getCfUserList = async (
  isActiveOnly: boolean,
  shouldIncludeRetired: boolean
): Promise<CfUser[]> => {
  try {
    const response = await axios.get<CfResponse<CfUser[]>>(
      `https://codeforces.com/api/user.ratedList?activeOnly=${isActiveOnly}&includeRetired=${shouldIncludeRetired}`
    );
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return parseCfResponse(response.data);
  } catch (error) {
    console.error('An error occurred:', error);
    throw new Error('Failed to fetch user list');
  }
};

export const getCfProblemSet = async (): Promise<CfProblemSet> => {
  try {
    const response = await axios.get<CfResponse<CfProblemSet>>(
      'https://codeforces.com/api/problemset.problems'
    );
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return parseCfResponse(response.data);
  } catch (error) {
    console.error('An error occurred:', error);
    throw new Error('Failed to fetch problem list');
  }
};

export const getCfContestList = async (): Promise<CfContest[]> => {
  try {
    const response = await axios.get<CfResponse<CfContest[]>>(
      'https://codeforces.com/api/contest.list?gym=false'
    );
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return parseCfResponse(response.data);
  } catch (error) {
    console.error('An error occurred:', error);
    throw new Error('Failed to fetch the contest list');
  }
};

export const getContestStandings = async (
  contestId: number,
  count: number
): Promise<CfContestStandings> => {
  try {
    const response = await axios.get<CfResponse<CfContestStandings>>(
      `https://codeforces.com/api/contest.standings?contestId=${contestId}&from=1&count=${count}&showUnofficial=false`
    );
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return parseCfResponse(response.data);
  } catch (error) {
    console.error('An error occurred:', error);
    throw new Error('Failed to fetch the contest standings');
  }
};
