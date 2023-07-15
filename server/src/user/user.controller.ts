import { getUser as getUserFromApi } from '../api/codeforces';
import {
  CodeforcesRank,
  ParsedUser,
  Problem,
  Problemset,
  User,
} from '../interfaces';
import {
  createUser,
  getRecentUser as getRecentUserFromDb,
} from './user.services';

const calculateRank = (rating: number): CodeforcesRank => {
  const rankMap: [number, CodeforcesRank][] = [
    [1200, CodeforcesRank.NEWBIE],
    [1400, CodeforcesRank.PUPIL],
    [1600, CodeforcesRank.SPECIALIST],
    [1900, CodeforcesRank.EXPERT],
    [2100, CodeforcesRank.CANDIDATE_MASTER],
    [2300, CodeforcesRank.MASTER],
    [2400, CodeforcesRank.INTERNATIONAL_MASTER],
    [2600, CodeforcesRank.GRANDMASTER],
    [3000, CodeforcesRank.INTERNATIONAL_GRANDMASTER],
  ];

  for (const [threshold, rank] of rankMap) if (rating < threshold) return rank;
  return CodeforcesRank.LEGENDARY_GRANDMASTER;
};

const parseUser = async (user: User): Promise<ParsedUser> => {
  const problems: Problem[] = [];
  for (const solution of Object.values(user.solutions))
    problems.push(solution.problem);
  const problemset = new Problemset(problems);

  const { rating, maxRating, solutions, contests } = user;
  const rank = calculateRank(rating);
  const maxRank = calculateRank(maxRating);

  const parsedUser: ParsedUser = {
    ...user,
    rank,
    maxRank,
    solutions: solutions.sort(
      (a, b) => b.submissionTimeSeconds - a.submissionTimeSeconds
    ),
    contests: contests.sort(
      (a, b) => (b.startTimeSeconds ?? 0) - (a.startTimeSeconds ?? 0)
    ),
    solveCount: Object.keys(user.solutions).length,
    contestCount: user.contests.length,
    problemset,
  };

  return parsedUser;
};

const getUser = async (handle: string): Promise<User> => {
  try {
    const existingUser = await getRecentUserFromDb(handle);
    if (existingUser) return existingUser;

    const user = await getUserFromApi(handle);
    const createdUser = await createUser(user);
    if (!createdUser) {
      console.error(`Failed to add user ${user.handle} to Database`);
      return user;
    }

    return createdUser;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch user from the API/database.');
  }
};

export const getParsedUser = async (handle: string): Promise<ParsedUser> => {
  try {
    const user = await getUser(handle);
    return parseUser(user);
  } catch (error) {
    console.error(error);
    throw new Error('Failed to parse user info.');
  }
};
