import express, { Request, Response } from 'express';
import { getParsedUser } from './user.controller';

const router = express.Router();

router.get('/:handle', async (req: Request, res: Response) => {
  try {
    const { handle } = req.params;
    const user = await getParsedUser(handle);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
    console.log(error);
  }
});

export default router;
