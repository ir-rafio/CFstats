import {
  Box,
  Divider,
  Heading,
  Link,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from '@chakra-ui/react';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getUser } from '../api';
import {
  ContestInfo,
  ParsedUser,
  Problem,
  UserSolution,
} from '../api/interfaces';
import ProblemsetComponent from '../problem/problemset.component';

const UserComponent = () => {
  const { handle } = useParams();
  const [userData, setUserData] = useState<ParsedUser | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getUser(handle || ' ');
        const user = response.data;
        setUserData(user);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, [handle]);

  if (!userData) return <div>Loading...</div>;

  const {
    name,
    country,
    city,
    organization,
    rating,
    maxRating,
    rank,
    maxRank,
    registrationTimeSeconds,
    photoLink,
    solveCount,
    contestCount,
    solutions,
    contests,
    problemset,
  } = userData;

  const rankColors = {
    Newbie: { color1: '#808080', color2: 'White' },
    Pupil: { color1: '#008000', color2: 'Black' },
    Specialist: { color1: '#03a89e', color2: 'Black' },
    Expert: { color1: '#0000ff', color2: 'White' },
    'Candidate Master': { color1: '#aa00aa', color2: 'White' },
    Master: { color1: '#ff8c00', color2: 'Black' },
    'International Master': { color1: '#ff8c00', color2: 'Black' },
    Grandmaster: { color1: '#ff0000', color2: 'White' },
    'International Grandmaster': { color1: '#ff0000', color2: 'White' },
    'Legendary Grandmaster': { color1: '#ff0000', color2: 'Black' },
  };

  const renderContestTable = (contests: ContestInfo[]) => {
    return (
      <Box maxH="400px" overflowY="scroll" width="100%">
        <Table>
          <Thead>
            <Tr>
              <Th>Contest</Th>
              <Th>Start Time</Th>
            </Tr>
          </Thead>
          <Tbody>
            {contests.map((contest) => (
              <Tr key={contest.id}>
                <Td>
                  <Link href={`../contest/${contest.id}`}>{contest.id}</Link>
                </Td>
                <Td>
                  {contest.startTimeSeconds &&
                    moment(contest.startTimeSeconds * 1000).format(
                      'YYYY-MM-DD HH:mm:ss'
                    )}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    );
  };

  const renderSolutionsTable = (solutions: UserSolution[]) => {
    return (
      <Box maxH="400px" overflowY="scroll" width="100%">
        <Table>
          <Thead>
            <Tr>
              <Th>Problem</Th>
              <Th>Solved at</Th>
              <Th>In contest</Th>
            </Tr>
          </Thead>
          <Tbody>
            {solutions.map((solution) => {
              const problem = solution.problem;
              // const problemKey = problem.getKey();
              const problemKey = Problem.generateKey(
                problem.contest.id,
                problem.index
              );

              return (
                <Tr key={problemKey}>
                  <Td>
                    <Link href={`../problem/${problemKey}`}>{problemKey}</Link>
                  </Td>
                  <Td>
                    {moment(solution.submissionTimeSeconds * 1000).format(
                      'YYYY-MM-DD HH:mm:ss'
                    )}
                  </Td>
                  <Td>{solution.contestFlag ? 'Yes' : 'No'}</Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Box>
    );
  };

  return (
    <VStack spacing={8} align="start" width="100%">
      <Stack direction="row" spacing="auto" width="100%">
        <Box width="25%">
          <img src={photoLink} alt="User" />
          <Heading size="lg">
            <Link href={'https://codeforces.com/profile/' + handle}>
              {handle}
            </Link>
          </Heading>
          <Text>{name}</Text>
        </Box>

        <Box width="20%">
          {organization && (
            <>
              <Text fontWeight="bold">Organization: </Text>
              <Text>{organization}</Text>
            </>
          )}
          {city && (
            <>
              <Text fontWeight="bold">City: </Text>
              <Text>{city}</Text>
            </>
          )}
          {country && (
            <>
              <Text fontWeight="bold">Country: </Text>
              <Text>{country}</Text>
            </>
          )}
          <Text fontWeight="bold">Rating: </Text>
          <Text color={rankColors[rank].color2} bg={rankColors[rank].color1}>
            {rating} - {rank}
          </Text>
          <Text fontWeight="bold">Max Rating: </Text>
          <Text
            color={rankColors[maxRank].color2}
            bg={rankColors[maxRank].color1}
          >
            {maxRating} - {maxRank}
          </Text>
          <Text fontWeight="bold">Registered: </Text>
          <Text>{moment(registrationTimeSeconds * 1000).fromNow()}</Text>
          <Text fontWeight="bold">Solve Count: </Text>
          <Text>{solveCount}</Text>
          <Text fontWeight="bold">Contest Count: </Text>
          <Text>{contestCount}</Text>
        </Box>

        <Box width="30%">
          <Heading size="md">Solutions</Heading>
          {renderSolutionsTable(solutions)}
        </Box>

        <Box width="25%">
          <Heading size="md">Contests</Heading>
          {renderContestTable(contests)}
        </Box>
      </Stack>

      <Divider />

      <ProblemsetComponent problemset={problemset} />
    </VStack>
  );
};

export default UserComponent;
