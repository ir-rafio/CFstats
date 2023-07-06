import {
  Box,
  Divider,
  HStack,
  Heading,
  Link,
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
import { ParsedUser, Problem, UserSolution } from '../api/interfaces';

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
    solveCount,
    contestCount,
    levels,
    difficulties,
    tags,
    solutions,
    contests,
  } = userData;

  const renderTable = (data: Record<string, number>) => {
    const headers = Object.keys(data);

    return (
      <Box maxH="200px" overflowY="scroll">
        <Table variant="simple" borderWidth="1px">
          <Tbody>
            {headers.map((header) => (
              <Tr key={header}>
                <Td>{header}</Td>
                <Td>{data[header]}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    );
  };

  const renderBarGraph = (data: Record<string, number>) => {
    return (
      <HStack spacing={2} align="center">
        {Object.entries(data).map(([key, value]) => (
          <Box
            key={key}
            flex="1"
            h="8px"
            bg="blue.500"
            rounded="md"
            opacity={0.8}
            width={`${value}%`}
          />
        ))}
      </HStack>
    );
  };

  const renderContestTable = (contests: number[]) => {
    return (
      <Box maxH="200px" overflowY="scroll">
        <Table>
          <Thead>
            <Tr>
              <Th>Contest</Th>
            </Tr>
          </Thead>
          <Tbody>
            {contests.map((id) => (
              <Tr key={id}>
                <Link href={`../contest/${id}`} isExternal color="blue.500">
                  {id}
                </Link>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    );
  };

  const renderSolutionsTable = (solutions: UserSolution[]) => {
    return (
      <Box maxH="200px" overflowY="scroll">
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
              const problemKey = Problem.generateKey(
                problem.contestId,
                problem.index
              );

              return (
                <Tr key={problemKey}>
                  <Td>
                    <Link href={`../problem/${problemKey}`}>{problemKey}</Link>
                  </Td>
                  <Td>
                    {moment(solution.submissionTime * 1000).format(
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
    <VStack spacing={8} align="start">
      <Box>
        <Heading size="lg">User Statistics: {handle}</Heading>
        <img src={userData.photoLink}></img>
        <Text fontWeight="bold">Name:</Text>
        <Text>{name}</Text>
        <Text fontWeight="bold">Country:</Text>
        <Text>{country}</Text>
        <Text fontWeight="bold">City:</Text>
        <Text>{city}</Text>
        <Text fontWeight="bold">Organization:</Text>
        <Text>{organization}</Text>
        <Text fontWeight="bold">Rating:</Text>
        <Text>
          {rating} - {rank}
        </Text>
        <Text fontWeight="bold">Max Rating:</Text>
        <Text>
          {maxRating} - {maxRank}
        </Text>
        <Text fontWeight="bold">Registered:</Text>
        <Text>{moment(registrationTimeSeconds * 1000).fromNow()}</Text>
        <Text fontWeight="bold">Solve Count:</Text>
        <Text>{solveCount}</Text>
        <Text fontWeight="bold">Contest Count:</Text>
        <Text>{contestCount}</Text>
      </Box>

      <Divider />

      <Box>
        <Heading size="md">Levels</Heading>
        {renderTable(levels)}
        {renderBarGraph(levels)}
      </Box>

      <Divider />

      <Box>
        <Heading size="md">Difficulties</Heading>
        {renderTable(difficulties)}
        {renderBarGraph(difficulties)}
      </Box>

      <Divider />

      <Box>
        <Heading size="md">Tags</Heading>
        {renderTable(tags)}
        {renderBarGraph(tags)}
      </Box>

      <Divider />

      <Box>
        <Heading size="md">Solutions</Heading>
        {renderSolutionsTable(solutions)}
      </Box>

      <Divider />

      <Box>
        <Heading size="md">Contests</Heading>
        {renderContestTable(contests)}
      </Box>
    </VStack>
  );
};

export default UserComponent;
