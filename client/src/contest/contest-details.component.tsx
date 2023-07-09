import {
  Box,
  Divider,
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
import { getContest } from '../api';
import { ContestDetails, ContestRank, Problem } from '../api/interfaces';

const ContestComponent = () => {
  const id = Number(useParams().id);
  const [contest, setContest] = useState<ContestDetails | null>(null);

  useEffect(() => {
    const fetchContest = async () => {
      try {
        const response = await getContest(id);
        const contest = response.data;
        setContest(contest);
      } catch (error) {
        console.error('Error fetching contest:', error);
      }
    };

    fetchContest();
  }, [id]);

  if (!contest) return <div>Loading...</div>;

  const { name, type, phase, startTime } = contest.info;
  const { rank, problems } = contest;

  const renderProblemsTable = (problems: Problem[]) => {
    return (
      <Box maxH="400px" overflowY="scroll">
        <Table>
          <Thead>
            <Tr>
              <Th>Index</Th>
              <Th>Name</Th>
              <Th>Difficulty</Th>
              <Th>Tags</Th>
            </Tr>
          </Thead>
          <Tbody>
            {problems.map((problem) => {
              const { index, name, difficulty, tags } = problem;
              const key = Problem.generateKey(id, index);

              return (
                <Tr key={index}>
                  <Td>{index}</Td>
                  <Td>
                    <Link href={`../problem/${key}`}>{name}</Link>
                  </Td>
                  <Td>{difficulty}</Td>
                  <Td>{tags.join(', ')}</Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Box>
    );
  };

  const renderRankTable = (rank: ContestRank[]) => {
    return (
      <Box maxH="400px" overflowY="scroll">
        <Table>
          <Thead>
            <Tr>
              <Th>Handle</Th>
              <Th>Position</Th>
            </Tr>
          </Thead>
          <Tbody>
            {rank.map((entry, index) => (
              <Tr key={index}>
                <Td>
                  <Link href={`../user/${entry.handle}`}>{entry.handle}</Link>
                </Td>
                <Td>{entry.position}</Td>
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
        <Heading size="lg">
          <Link href={`https://codeforces.com/contest/${id}`}>{name}</Link>
        </Heading>
        <Text fontWeight="bold">Type:</Text>
        <Text>{type}</Text>
        <Text fontWeight="bold">Phase:</Text>
        <Text>{phase}</Text>
        <Text fontWeight="bold">Start Time:</Text>
        <Text>
          {startTime
            ? moment(startTime * 1000).format('YYYY-MM-DD HH:mm:ss')
            : 'Not available'}
        </Text>
      </Box>
      {problems.length > 0 && (
        <>
          <Divider />
          <Box>
            <Heading size="md">Problems</Heading>
            {renderProblemsTable(problems)}
          </Box>
        </>
      )}
      {rank.length > 0 && (
        <>
          <Divider />
          <Box>
            <Heading size="md">Rank</Heading>
            {renderRankTable(rank)}
          </Box>
        </>
      )}
    </VStack>
  );
};

export default ContestComponent;
