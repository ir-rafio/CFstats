import axios, { AxiosResponse } from 'axios';
import { ContestDetails, ParsedUser, Problem } from './interfaces';

const url = 'http://localhost:4000';

export const getUser = async (
  handle: string
): Promise<AxiosResponse<ParsedUser>> =>
  await axios.get(`${url}/user/${handle}`);

export const getProblem = async (
  key: string
): Promise<AxiosResponse<Problem>> => await axios.get(`${url}/problem/${key}`);

export const getContest = async (
  id: number
): Promise<AxiosResponse<ContestDetails>> =>
  await axios.get(`${url}/contest/${id}`);
