import express, { Request, Response } from 'express';
import { getContestList } from './contest.controller';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const contestList = await getContestList();
    res.status(200).json(contestList);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
    console.log(error);
  }
});

export default router;
