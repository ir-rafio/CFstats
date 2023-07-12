import { Problem } from '../api/interfaces';

import { Box, Flex, Heading } from '@chakra-ui/react';
import { parseProblemset, renderBarGraph } from './utils';

interface ProblemsetProps {
  problems: Problem[];
}

const Problemset: React.FC<ProblemsetProps> = ({ problems }) => {
  const { levels, difficulties, tags } = parseProblemset(problems);

  return (
    <Flex>
      <Box width="30%">
        <Heading size="md">Levels</Heading>
        {renderBarGraph(levels, 'Levels: empty!')}
      </Box>
      <Box width="30%" ml="5%">
        <Heading size="md">Difficulties</Heading>
        {renderBarGraph(difficulties, 'Difficulties: empty!!')}
      </Box>
      <Box width="30%" ml="5%">
        <Heading size="md">Tags</Heading>
        {renderBarGraph(tags, 'Tags: empty!')}
      </Box>
    </Flex>
  );
};

export default Problemset;
