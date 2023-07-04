import {
  Box,
  Divider,
  HStack,
  Heading,
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
import { ParsedUser, UserSolutions, getUser } from '../api';

const UserComponent = () => {
  const { handle } = useParams();
  const [userData, setUserData] = useState<ParsedUser | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getUser(handle || ' ');
        const user = response.data;
        console.log(user);
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
    console.log('Contests:', contests);
    console.log(contests.length);

    return (
      <Box maxH="200px" overflowY="scroll">
        <Table>
          <Thead>
            <Tr>
              <Th>Contest</Th>
            </Tr>
          </Thead>
          <Tbody>
            {Array.from(contests).map((id) => (
              <Tr key={id}>
                <Td>{id}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    );
  };

  const renderSolutionsTable = (solutions: UserSolutions) => {
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
            {Object.entries(solutions).map(([problemKey, solution]) => (
              <Tr key={problemKey}>
                <Td>
                  <a href={`../problem/${problemKey}`}>{problemKey}</a>
                </Td>
                <Td>
                  {moment(solution.submissionTime * 1000).format(
                    'YYYY-MM-DD HH:mm:ss'
                  )}
                </Td>
                <Td>{solution.contestFlag ? 'Yes' : 'No'}</Td>
              </Tr>
            ))}
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
        {renderBarGraph(levels)}
      </Box>

      <Divider />

      <Box>
        <Heading size="md">Difficulties</Heading>
        {renderBarGraph(difficulties)}
      </Box>

      <Divider />

      <Box>
        <Heading size="md">Tags</Heading>
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
        {renderContestTable(Array.from(contests))}
      </Box>
    </VStack>
  );
};

export default UserComponent;
