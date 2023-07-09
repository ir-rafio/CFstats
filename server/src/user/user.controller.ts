import { getUser as getUserFromApi } from '../api/codeforces/middleware';
import { User } from '../api/codeforces/middleware/interfaces';
import { createUser, getUser as getUserFromDb } from './user.services';

enum CodeforcesRank {
  Newbie = 'Newbie',
  Pupil = 'Pupil',
  Specialist = 'Specialist',
  Expert = 'Expert',
  CandidateMaster = 'Candidate Master',
  Master = 'Master',
  InternationalMaster = 'International Master',
  Grandmaster = 'Grandmaster',
  InternationalGrandmaster = 'International Grandmaster',
  LegendaryGrandmaster = 'Legendary Grandmaster',
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
    [1200, CodeforcesRank.Newbie],
    [1400, CodeforcesRank.Pupil],
    [1600, CodeforcesRank.Specialist],
    [1900, CodeforcesRank.Expert],
    [2100, CodeforcesRank.CandidateMaster],
    [2300, CodeforcesRank.Master],
    [2400, CodeforcesRank.InternationalMaster],
    [2600, CodeforcesRank.Grandmaster],
    [3000, CodeforcesRank.InternationalGrandmaster],
  ];

  for (const [threshold, rank] of rankMap) if (rating < threshold) return rank;
  return CodeforcesRank.LegendaryGrandmaster;
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

  const { rating, maxRating } = user;
  const rank = calculateRank(rating);
  const maxRank = calculateRank(maxRating);

  const parsedUser: ParsedUser = {
    ...user,
    rank,
    maxRank,
    solutions: user.solutions.sort(
      (a, b) => b.submissionTime - a.submissionTime
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
