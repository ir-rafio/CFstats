import {
  Box,
  Divider,
  Flex,
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

  let {
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
    levels,
    difficulties,
    tags,
    solutions,
    contests,
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

  const renderBarGraph = (
    data: Record<string, number>,
    emptyMessage: string
  ) => {
    const numRecords = Object.keys(data).length;
    const maxValue = Math.max(...Object.values(data));

    if (numRecords === 0 || maxValue <= 0) {
      return <Text>{emptyMessage}</Text>;
    }

    const graphWidth = 500;
    const graphHeight = 300;
    const gap = 20;
    const barWidth = Math.max(graphWidth / numRecords, 100);

    return (
      <Flex direction="column" alignItems="center">
        <Box
          width={graphWidth}
          height={graphHeight + 4 * gap}
          overflowX="scroll"
        >
          <Flex justifyContent="flex-start" width={barWidth * numRecords}>
            {Object.entries(data).map(([key, value]) => {
              const barHeight = graphHeight * (value / maxValue);
              const bottomY = graphHeight + gap;
              const topY = bottomY - barHeight;
              const valueY = topY - gap;
              const keyY = bottomY + gap;

              return (
                <Flex
                  key={key}
                  direction="column"
                  alignItems="center"
                  width={barWidth}
                  height={graphHeight}
                  position="relative"
                >
                  <Box
                    bg="blue.500"
                    height={barHeight}
                    width="100%"
                    position="absolute"
                    top={topY + 'px'}
                    border="1px solid black"
                  />
                  <Text fontSize="sm" position="absolute" top={valueY + 'px'}>
                    {value}
                  </Text>
                  <Text fontSize="sm" position="absolute" top={keyY + 'px'}>
                    {key}
                  </Text>
                </Flex>
              );
            })}
          </Flex>
        </Box>
      </Flex>
    );
  };

  const renderContestTable = (contests: number[]) => {
    return (
      <Box maxH="400px" overflowY="scroll">
        <Table>
          <Thead>
            <Tr>
              <Th>Contest</Th>
            </Tr>
          </Thead>
          <Tbody>
            {contests.map((id) => (
              <Tr key={id}>
                <Link href={`../contest/${id}`}>{id}</Link>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    );
  };

  const renderSolutionsTable = (solutions: UserSolution[]) => {
    return (
      <Box maxH="400px" overflowY="scroll">
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
      <Box display="flex" alignItems="center">
        <Flex mr="auto">
          <Box>
            <img src={photoLink} alt="User" />
            <Heading size="lg">
              <Link href={'https://codeforces.com/profile/' + handle}>
                {handle}
              </Link>
            </Heading>
            <Text>{name}</Text>
          </Box>

          <Box ml="auto">
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
        </Flex>

        <Flex>
          <Box ml="auto">
            <Heading size="md">Solutions</Heading>
            {renderSolutionsTable(solutions)}
          </Box>

          <Box ml="auto">
            <Heading size="md">Contests</Heading>
            {renderContestTable(contests)}
          </Box>
        </Flex>
      </Box>

      <Divider />

      <Flex>
        <Box width="30%">
          <Heading size="md">Levels</Heading>
          {renderBarGraph(levels, 'Empty')}
        </Box>
        <Box width="30%" ml="5%">
          <Heading size="md">Difficulties</Heading>
          {renderBarGraph(difficulties, 'Empty')}
        </Box>
        <Box width="30%" ml="5%">
          <Heading size="md">Tags</Heading>
          {renderBarGraph(tags, 'Empty')}
        </Box>
      </Flex>
    </VStack>
  );
};

export default UserComponent;
