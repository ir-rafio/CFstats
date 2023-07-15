import express, { Request, Response } from 'express';
import { getFilteredProblems, getProblem } from './problem.controller';

const router = express.Router();
interface QueryParams {
  levelFrom?: string;
  levelTo?: string;
  difficultyFrom?: number;
  difficultyTo?: number;
  timeSecondsFrom?: number;
  timeSecondsTo?: number;
  tags?: string[];
  shouldCombineTagsByOr?: boolean;
}

const parseQuery = (query: any): QueryParams => {
  const { levelFrom, levelTo, tags, shouldCombineTagsByOr } = query;

  const difficultyFrom = query.difficultyFrom
    ? Number(query.difficultyFrom)
    : undefined;
  const difficultyTo = query.difficultyTo
    ? Number(query.difficultyTo)
    : undefined;
  const timeSecondsFrom = query.timeSecondsFrom
    ? Number(query.timeSecondsFrom)
    : undefined;
  const timeSecondsTo = query.timeSecondsTo
    ? Number(query.timeSecondsTo)
    : undefined;

  return {
    levelFrom,
    levelTo,
    difficultyFrom,
    difficultyTo,
    timeSecondsFrom,
    timeSecondsTo,
    tags,
    shouldCombineTagsByOr,
  };
};

const createPrismaFilter = (query: QueryParams): object => {
  const prismaFilter: any = {};

  const {
    levelFrom,
    levelTo,
    difficultyFrom,
    difficultyTo,
    timeSecondsFrom,
    timeSecondsTo,
    tags,
    shouldCombineTagsByOr,
  } = query;

  // TODO: Find a way to use level
  if (levelFrom || levelTo) {
    prismaFilter.index = {};

    if (levelFrom) prismaFilter.index.gte = levelFrom;

    if (levelTo) {
      const increasedLevelTo = String.fromCharCode(levelTo.charCodeAt(0) + 1);
      prismaFilter.index.lt = increasedLevelTo;
    }
  }

  if (difficultyFrom || difficultyTo) {
    prismaFilter.difficulty = {};

    if (difficultyFrom) prismaFilter.difficulty.gte = difficultyFrom;
    if (difficultyTo) prismaFilter.difficulty.lte = difficultyTo;
  }

  if (timeSecondsFrom || timeSecondsTo) {
    prismaFilter.contest = {};
    prismaFilter.contest.startTimeSeconds = {};

    if (timeSecondsFrom)
      prismaFilter.contest.startTimeSeconds.gte = timeSecondsFrom;
    if (timeSecondsTo)
      prismaFilter.contest.startTimeSeconds.lte = timeSecondsTo;
  }

  if (tags && tags.length > 0) {
    if (shouldCombineTagsByOr === true)
      prismaFilter.tags = { some: { name: { in: tags } } };
    else prismaFilter.tags = { every: { name: { in: tags } } };
  }

  return prismaFilter;
};

router.get('/many', async (req: Request, res: Response) => {
  try {
    // TODO: Check query types from front-end
    const queryParams: QueryParams = parseQuery(req.query);
    // const queryParams: QueryParams = req.query;
    const prismaFilter = createPrismaFilter(queryParams);
    const problemList = await getFilteredProblems(prismaFilter);
    res.status(200).json(problemList);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
    console.error(error);
  }
});

router.get('/:key', async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const problemList = await getProblem(key);
    res.status(200).json(problemList);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
    console.error(error);
  }
});

export default router;
