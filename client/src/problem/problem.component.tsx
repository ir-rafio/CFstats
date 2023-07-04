import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Problem, getProblem } from '../api';

const ProblemComponent = () => {
  const { key } = useParams();
  const [problemData, setProblemData] = useState<Problem | null>(null);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const response = await getProblem(key || ' ');
        const problem = response.data;
        console.log(problem);
        setProblemData(problem);
      } catch (error) {
        console.error('Error fetching problem:', error);
      }
    };

    fetchProblem();
  }, [key]);

  if (!problemData) return <div>Loading...</div>;

  const { contestId, index, name, rating, tags } = problemData;

  return (
    <VStack spacing={8} align="start">
      <Box>
        <Heading size="lg">Problem: {key}</Heading>
        <Text fontWeight="bold">Contest ID:</Text>
        <Text>{contestId}</Text>
        <Text fontWeight="bold">Index:</Text>
        <Text>{index}</Text>
        <Text fontWeight="bold">Name:</Text>
        <Text>{name}</Text>
        <Text fontWeight="bold">Rating:</Text>
        <Text>{rating}</Text>
        <Text fontWeight="bold">Tags:</Text>
        <Text>{tags.join(', ')}</Text>
      </Box>
    </VStack>
  );
};

export default ProblemComponent;
