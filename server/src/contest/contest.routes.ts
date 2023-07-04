import express, { Request, Response } from 'express';
import { getContest } from './contest.controller';

const router = express.Router();

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id: number = Number(req.params.id);
    const contestList = await getContest(id);
    res.status(200).json(contestList);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
    console.log(error);
  }
});

export default router;
