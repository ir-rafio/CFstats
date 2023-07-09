import { Box, Heading, Link, Text, VStack } from '@chakra-ui/react';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProblem } from '../api';
import { Problem } from '../api/interfaces';

const ProblemComponent = () => {
  const { key } = useParams();
  const [problemData, setProblemData] = useState<Problem | null>(null);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const response = await getProblem(key || ' ');
        const problem = response.data;
        setProblemData(problem);
      } catch (error) {
        console.error('Error fetching problem:', error);
      }
    };

    fetchProblem();
  }, [key]);

  if (!problemData) return <div>Loading...</div>;

  const { contest, index, name, difficulty, tags } = problemData;
  const { startTimeSeconds } = contest;

  return (
    <VStack spacing={8} align="start">
      <Box>
        <Heading size="lg">
          <Link
            href={`https://codeforces.com/contest/${contest.id}/problem/${index}`}
          >
            {name}
          </Link>
        </Heading>
        <Text fontWeight="bold">Contest ID:</Text>
        <Link href={`../contest/${contest.id}`}>{contest.id}</Link>
        {startTimeSeconds && (
          <>
            <Text fontWeight="bold">Time:</Text>
            <Text>
              {moment(startTimeSeconds * 1000).format('YYYY-MM-DD HH:mm:ss')}
            </Text>
          </>
        )}
        <Text fontWeight="bold">Index:</Text>
        <Text>{index}</Text>
        <Text fontWeight="bold">Difficulty:</Text>
        <Text>{difficulty ?? 'Unknown'}</Text>
        <Text fontWeight="bold">Tags:</Text>
        <Text>{tags.join(', ')}</Text>
      </Box>
    </VStack>
  );
};

export default ProblemComponent;
