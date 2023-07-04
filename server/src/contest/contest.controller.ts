import * as CfApi from '../api/codeforces';
// import { prisma } from '../prisma';

export const getContest = async (contestId: number): Promise<CfApi.Contest> => {
  // const existingContest = await prisma.contest.findUnique({
  //   where: { id: contestId },
  //   include: { rank: true },
  // });

  // if (existingContest) return existingContest;

  try {
    const contest = await CfApi.getContest(contestId);

    // const createdContest = await prisma.contest.create({
    //   data: {
    //     id: contestId,
    //     name: contest.name,
    //     type: contest.type,
    //     phase: contest.phase,
    //     startTimeSeconds: contest.startTimeSeconds,
    //     rank: {
    //       create: contest.rank.map((rankData: CfApi.ContestRank) => ({
    //         handle: rankData.handle,
    //         position: rankData.position,
    //       })),
    //     },
    //   },
    //   include: { rank: true },
    // });

    // return createdContest;

    return contest;
  } catch (error) {
    throw new Error('Failed to fetch the contest from the API.');
  }
};

export const getContestList = async (): Promise<CfApi.Contest[]> => {
  // const existingContestList = await prisma.contest.findMany({
  //   include: { rank: true },
  // });

  // if (existingContestList.length > 0) {
  //   return existingContestList;
  // }

  try {
    const contestList = await CfApi.getContestList();

    // const upsertContestList = contestList.map((contest) => ({
    //   where: { id: contest.id },
    //   create: {
    //     id: contest.id,
    //     name: contest.name,
    //     type: contest.type,
    //     phase: contest.phase,
    //     startTimeSeconds: contest.startTimeSeconds,
    //     rank: {
    //       create: contest.rank.map((rankData: CfApi.ContestRank) => ({
    //         handle: rankData.handle,
    //         position: rankData.position,
    //       })),
    //     },
    //   },
    //   update: {
    //     name: contest.name,
    //     type: contest.type,
    //     phase: contest.phase,
    //     startTimeSeconds: contest.startTimeSeconds,
    //     rank: {
    //       create: contest.rank.map((rankData: CfApi.ContestRank) => ({
    //         handle: rankData.handle,
    //         position: rankData.position,
    //       })),
    //     },
    //   },
    //   include: { rank: true },
    // }));

    // const createdContestList = await prisma.contest.upsertMany({
    //   where: { id: { in: contestList.map((contest) => contest.id) } },
    //   create: upsertContestList.map((contest) => contest.create),
    //   update: upsertContestList.map((contest) => contest.update),
    //   include: { rank: true },
    // });

    // return createdContestList;
    return contestList;
  } catch (error) {
    throw new Error('Failed to fetch the contests from the API.');
  }
};

export const getUpcomingContests = async (): Promise<CfApi.Contest[]> => {
  // const upcomingContests = await prisma.contest.findMany({
  //   where: {
  //     phase: 'BEFORE',
  //   },
  //   include: { rank: true },
  // });

  const contestList = await getContestList();

  const upcomingContests = contestList.filter(
    (contest) => contest.phase === 'BEFORE'
  );

  return upcomingContests;
};
