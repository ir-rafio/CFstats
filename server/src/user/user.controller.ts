import { getUser as getUserFromApi } from '../api/codeforces';
import { User } from '../api/codeforces/interfaces';
import { createUser, getUser as getUserFromDb } from './user.services';

enum CodeforcesRank {
  NEWBIE = 'Newbie',
  PUPIL = 'Pupil',
  SPECIALIST = 'Specialist',
  EXPERT = 'Expert',
  CANDIDATE_MASTER = 'Candidate Master',
  MASTER = 'Master',
  INTERNATIONAL_MASTER = 'International Master',
  GRANDMASTER = 'Grandmaster',
  INTERNATIONAL_GRANDMASTER = 'International Grandmaster',
  LEGENDARY_GRANDMASTER = 'Legendary Grandmaster',
}

export interface ParsedUser extends User {
  rank: CodeforcesRank;
  maxRank: CodeforcesRank;
  solveCount: number;
  contestCount: number;
  levels: Record<string, number>;
  difficulties: Record<string, number>;
  tags: Record<string, number>;
}

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
  const levels: Record<string, number> = {};
  const difficulties: Record<string, number> = {};
  const tags: Record<string, number> = {};

  for (const solution of Object.values(user.solutions)) {
    const problem = solution.problem;
    const level = problem.getLevel();
    const difficulty = problem.difficulty ?? 'Unknown';

    levels[level] = levels[level] + 1 || 1;
    difficulties[difficulty] = difficulties[difficulty] + 1 || 1;
    for (const tag of problem.tags) tags[tag] = tags[tag] + 1 || 1;
  }

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
    levels: Object.fromEntries(Object.entries(levels).sort()),
    difficulties: Object.fromEntries(Object.entries(difficulties).sort()),
    tags: Object.fromEntries(Object.entries(tags).sort((a, b) => b[1] - a[1])),
  };

  return parsedUser;
};

const getUser = async (handle: string): Promise<User> => {
  try {
    const existingUser = await getUserFromDb(handle);
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
