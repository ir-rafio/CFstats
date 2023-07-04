import * as CfApi from '../api/codeforces';
// import { prisma } from '../prisma';

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

interface ParsedUser {
  handle: string;
  name: string;
  country?: string;
  city?: string;
  organization?: string;
  rating: number;
  maxRating: number;
  rank: CodeforcesRank;
  maxRank: CodeforcesRank;
  registrationTimeSeconds: number;
  photoLink: string;
  solveCount: number;
  contestCount: number;
  levels: Record<string, number>;
  difficulties: Record<string, number>;
  tags: Record<string, number>;
  solutions: CfApi.UserSolutions;
  contests: Set<number>;
}

const getProblemLevel = (index: string): string => {
  if (index && index[0].match(/[A-Za-z]/)) {
    return index[0].toUpperCase();
  } else {
    return '0';
  }
};

const parseUser = async (user: CfApi.User): Promise<ParsedUser> => {
  const levels: Record<string, number> = {};
  const difficulties: Record<string, number> = {};
  const tags: Record<string, number> = {};

  for (const solution of Object.values(user.solutions)) {
    const problem = solution.problem;
    const level = getProblemLevel(problem.index);
    const difficulty = problem.rating;

    levels[level] = levels[level] + 1 || 1;
    difficulties[difficulty] = difficulties[difficulty] + 1 || 1;
    for (const tag of problem.tags) tags[tag] = tags[tag] + 1 || 1;
  }

  const {
    handle,
    name,
    country,
    city,
    organization,
    rating,
    maxRating,
    registrationTimeSeconds,
    photoLink,
    solutions,
    contests,
  } = user;

  const rank = calculateRank(rating);
  const maxRank = calculateRank(maxRating);

  const parsedUser: ParsedUser = {
    handle,
    name,
    country,
    city,
    organization,
    rating,
    maxRating,
    rank,
    maxRank,
    registrationTimeSeconds,
    photoLink,
    solveCount: Object.keys(user.solutions).length,
    contestCount: user.contests.size,
    levels: Object.fromEntries(Object.entries(levels).sort()),
    difficulties: Object.fromEntries(Object.entries(difficulties).sort()),
    tags: Object.fromEntries(Object.entries(tags).sort()),
    solutions,
    contests,
  };

  return parsedUser;
};

const calculateRank = (rating: number): CodeforcesRank => {
  if (rating < 1200) {
    return CodeforcesRank.Newbie;
  } else if (rating < 1400) {
    return CodeforcesRank.Pupil;
  } else if (rating < 1600) {
    return CodeforcesRank.Specialist;
  } else if (rating < 1900) {
    return CodeforcesRank.Expert;
  } else if (rating < 2100) {
    return CodeforcesRank.CandidateMaster;
  } else if (rating < 2300) {
    return CodeforcesRank.Master;
  } else if (rating < 2400) {
    return CodeforcesRank.InternationalMaster;
  } else if (rating < 2600) {
    return CodeforcesRank.Grandmaster;
  } else if (rating < 3000) {
    return CodeforcesRank.InternationalGrandmaster;
  } else {
    return CodeforcesRank.LegendaryGrandmaster;
  }
};

const getUser = async (handle: string): Promise<CfApi.User> => {
  // const existingUser = await prisma.user.findUnique({
  //   where: { handle },
  // });

  // if (existingUser) {
  //   return existingUser;
  // }

  try {
    const user = await CfApi.getUser(handle);

    // const createdUser = await prisma.user.create({
    //   data: {
    //     handle: user.handle,
    //     name: user.name,
    //     country: user.country,
    //     city: user.city,
    //     organization: user.organization,
    //     rating: user.rating,
    //     maxRating: user.maxRating,
    //     registrationTimeSeconds: user.registrationTimeSeconds,
    //     photoLink: user.photoLink,
    //   },
    // });

    // return createdUser;
    return user;
  } catch (error) {
    throw new Error('Failed to fetch the user from the API.');
  }
};

export const getParsedUser = async (handle: string): Promise<ParsedUser> => {
  try {
    const user = await getUser(handle);
    return parseUser(user);
  } catch (error) {
    throw new Error('Failed to fetch the user from the API.');
  }
};
