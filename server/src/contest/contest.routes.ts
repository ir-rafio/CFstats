import express, { Request, Response } from 'express';
import { getContest, getFilteredContests } from './contest.controller';

const router = express.Router();

router.get('/many', async (req: Request, res: Response) => {
  try {
    const contestList = await getFilteredContests({});
    res.status(200).json(contestList);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
    console.error(error);
  }
});

router.get('/upcoming', async (req: Request, res: Response) => {
  try {
    const contestList = await getFilteredContests({
      phase: { not: 'FINISHED' },
    });
    res.status(200).json(contestList);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
    console.error(error);
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id: number = Number(req.params.id);
    const contest = await getContest(id);
    res.status(200).json(contest);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
    console.error(error);
  }
});

export default router;
