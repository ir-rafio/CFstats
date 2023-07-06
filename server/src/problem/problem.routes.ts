import express, { Request, Response } from 'express';
import { getProblem, getProblemList } from './problem.controller';

const router = express.Router();

router.get('/many', async (req: Request, res: Response) => {
  try {
    const problemList = await getProblemList();
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
