import {
  Box,
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
import { Contest, getContest } from '../api';

const ContestComponent = () => {
  const id = Number(useParams().id);
  const [contestData, setContestData] = useState<Contest | null>(null);

  useEffect(() => {
    const fetchContest = async () => {
      try {
        const response = await getContest(id);
        const contest = response.data;
        console.log(contest);
        setContestData(contest);
      } catch (error) {
        console.error('Error fetching contest:', error);
      }
    };

    fetchContest();
  }, [id]);

  if (!contestData) return <div>Loading...</div>;

  const { name, type, phase, startTimeSeconds, rank } = contestData;

  return (
    <VStack spacing={8} align="start">
      <Box>
        <Heading size="lg">Contest: {id}</Heading>
        <Text fontWeight="bold">Name:</Text>
        <Text>{name}</Text>
        <Text fontWeight="bold">Type:</Text>
        <Text>{type}</Text>
        <Text fontWeight="bold">Phase:</Text>
        <Text>{phase}</Text>
        <Text fontWeight="bold">Start Time:</Text>
        <Text>
          {startTimeSeconds
            ? moment(startTimeSeconds * 1000).format('YYYY-MM-DD HH:mm:ss')
            : 'Not available'}
        </Text>
        <Text fontWeight="bold">Rank:</Text>
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
                <Td>{entry.handle}</Td>
                <Td>{entry.position}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </VStack>
  );
};

export default ContestComponent;
