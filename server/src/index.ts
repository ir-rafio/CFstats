import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

import contestRoutes from './contest/contest.routes';
import problemRoutes from './problem/problem.routes';
import userRoutes from './user/user.routes';

dotenv.config();

const app = express();
const PORT: number = Number(process.env.PORT) || 4001;

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

app.use('/user', userRoutes);
app.use('/problem', problemRoutes);
app.use('/contest', contestRoutes);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
