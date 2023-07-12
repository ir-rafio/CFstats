import axios, { AxiosResponse } from 'axios';
import { Contest, ContestDetails, ParsedUser, Problem } from './interfaces';

const url = 'http://localhost:4000';

export const getUser = async (
  handle: string
): Promise<AxiosResponse<ParsedUser>> => {
  try {
    return await axios.get(`${url}/user/${handle}`);
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch user data from the server.');
  }
};

export const getProblem = async (
  key: string
): Promise<AxiosResponse<Problem>> => {
  try {
    return await axios.get(`${url}/problem/${key}`);
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch problem data from the server.');
  }
};

export const getContest = async (
  id: number
): Promise<AxiosResponse<ContestDetails>> => {
  try {
    return await axios.get(`${url}/contest/${id}`);
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch contest data from the server.');
  }
};

export const getProblemList = async (): Promise<AxiosResponse<Problem[]>> => {
  try {
    return await axios.get(`${url}/problem/many`);
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch problem list from the server.');
  }
};

export const getContestList = async (): Promise<AxiosResponse<Contest[]>> => {
  try {
    return await axios.get(`${url}/contest/many`);
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch contest list from the server.');
  }
};

export const getUpcomingContests = async (
  mode: 'ONGOING' | 'UPCOMING' | 'TODAY' | 'THIS WEEK'
): Promise<Contest[]> => {
  try {
    const response: AxiosResponse<Contest[]> = await axios.get(
      `${url}/contest/upcoming`
    );
    const contests: Contest[] = response.data;
    const currentTime = new Date();

    if (mode === 'ONGOING') {
      return contests.filter((contest) => contest.phase === 'CODING');
    } else if (mode === 'UPCOMING') {
      return contests.filter((contest) => contest.phase === 'BEFORE');
    } else if (mode === 'TODAY') {
      const startOfDay = new Date(
        currentTime.getFullYear(),
        currentTime.getMonth(),
        currentTime.getDate(),
        0,
        0,
        0
      );
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

      return contests.filter(
        (contest) =>
          contest.startTimeSeconds &&
          new Date(contest.startTimeSeconds * 1000) >= startOfDay &&
          new Date(contest.startTimeSeconds * 1000) < endOfDay
      );
    } else if (mode === 'THIS WEEK') {
      const startOfWeek = new Date(
        currentTime.getFullYear(),
        currentTime.getMonth(),
        currentTime.getDate() - currentTime.getDay(),
        0,
        0,
        0
      );
      const endOfWeek = new Date(
        startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000
      );

      return contests.filter(
        (contest) =>
          contest.startTimeSeconds &&
          new Date(contest.startTimeSeconds * 1000) >= startOfWeek &&
          new Date(contest.startTimeSeconds * 1000) < endOfWeek
      );
    } else {
      return contests;
    }
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch contests from the server.');
  }
};
