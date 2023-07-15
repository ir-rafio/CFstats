import { PrismaClient } from '@prisma/client';
import { Problem } from './interfaces';

export const prisma = new PrismaClient().$extends({
  result: {
    problem: {
      level: {
        needs: { index: true },
        compute(problem) {
          return Problem.getLevel(problem.index);
        },
      },
    },
  },
});

export default prisma;
