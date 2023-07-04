import express, { Request, Response } from 'express';
import { getProblem, getProblemList } from './problem.controller';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const problemList = await getProblemList();
    res.status(200).json(problemList);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
    console.log(error);
  }
});

router.get('/:key', async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const problemList = await getProblem(key);
    res.status(200).json(problemList);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
    console.log(error);
  }
});

export default router;
