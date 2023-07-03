import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

// import * as contestRoutes from './contests/routes';
// import * as problemRoutes from './problems/routes';
// import * as userRoutes from './users/routes';

dotenv.config();

const app = express();
const PORT: number = Number(process.env.PORT) || 4001;

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// app.use('/users', userRoutes);
// app.use('/contests', contestRoutes);
// app.use('/problems', problemRoutes);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
