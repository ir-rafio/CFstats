export interface CfUser {
  handle: string;
  email?: string;
  vkId?: string;
  openId?: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  city?: string;
  organization?: string;
  contribution: number;
  rank: string;
  rating: number;
  maxRank: string;
  maxRating: number;
  lastOnlineTimeSeconds: number;
  registrationTimeSeconds: number;
  friendOfCount: number;
  avatar: string;
  titlePhoto: string;
}

export interface CfProblem {
  contestId?: number;
  problemsetName?: string;
  index: string;
  name: string;
  type: 'PROGRAMMING' | 'QUESTION';
  points?: number;
  rating?: number;
  tags: string[];
}

export interface CfContest {
  id: number;
  name: string;
  type: 'CF' | 'IOI' | 'ICPC';
  phase:
    | 'BEFORE'
    | 'CODING'
    | 'PENDING_SYSTEM_TEST'
    | 'SYSTEM_TEST'
    | 'FINISHED';
  frozen: boolean;
  durationSeconds: number;
  startTimeSeconds?: number;
  relativeTimeSeconds?: number;
  preparedBy?: string;
  websiteUrl?: string;
  description?: string;
  difficulty?: number;
  kind?: string;
  icpcRegion?: string;
  country?: string;
  city?: string;
  season?: string;
}

export interface CfMember {
  handle: string;
  name?: string;
}

export interface CfParty {
  contestId?: number;
  members: CfMember[];
  participantType:
    | 'CONTESTANT'
    | 'PRACTICE'
    | 'VIRTUAL'
    | 'MANAGER'
    | 'OUT_OF_COMPETITION';
  teamId?: number;
  teamName?: string;
  ghost: boolean;
  room?: number;
  startTimeSeconds?: number;
}

export interface CfSubmission {
  id: number;
  contestId?: number;
  creationTimeSeconds: number;
  relativeTimeSeconds: number;
  problem: CfProblem;
  author: CfParty;
  programmingLanguage: string;
  verdict?:
    | 'FAILED'
    | 'OK'
    | 'PARTIAL'
    | 'COMPILATION_ERROR'
    | 'RUNTIME_ERROR'
    | 'WRONG_ANSWER'
    | 'PRESENTATION_ERROR'
    | 'TIME_LIMIT_EXCEEDED'
    | 'MEMORY_LIMIT_EXCEEDED'
    | 'IDLENESS_LIMIT_EXCEEDED'
    | 'SECURITY_VIOLATED'
    | 'CRASHED'
    | 'INPUT_PREPARATION_CRASHED'
    | 'CHALLENGED'
    | 'SKIPPED'
    | 'TESTING'
    | 'REJECTED';
  testset?:
    | 'SAMPLES'
    | 'PRETESTS'
    | 'TESTS'
    | 'CHALLENGES'
    | 'TESTS1'
    | 'TESTS2'
    | 'TESTS3'
    | 'TESTS4'
    | 'TESTS5'
    | 'TESTS6'
    | 'TESTS7'
    | 'TESTS8'
    | 'TESTS9'
    | 'TESTS10';
  passedTestCount: number;
  timeConsumedMillis: number;
  memoryConsumedBytes: number;
  points?: number;
}

export interface CfProblemStatistics {
  contestId: number;
  index: string;
  solvedCount: number;
}

export interface CfProblemResult {
  points: number;
  penalty?: number;
  rejectedAttemptCount: number;
  type: 'PRELIMINARY' | 'FINAL';
  bestSubmissionTimeSeconds?: number;
}

export interface CfRankListRow {
  party: CfParty;
  rank: number;
  points: number;
  penalty: number;
  successfulHackCount: number;
  unsuccessfulHackCount: number;
  problemResults: CfProblemResult[];
  lastSubmissionTimeSeconds?: number;
}

export interface CfContestStandings {
  contest: CfContest;
  problems: CfProblem[];
  rows: CfRankListRow[];
}

export interface CfProblemSet {
  problems: CfProblem[];
  problemStatistics: CfProblemStatistics[];
}

export interface CfResponse<T> {
  status: 'OK' | 'FAILED';
  comment?: string;
  result?: T;
}
