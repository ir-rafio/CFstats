import { Problemset } from '../api/interfaces';

import { Box, Flex, Heading } from '@chakra-ui/react';
import { getStats, renderBarGraph } from './utils';

interface ProblemsetProps {
  problemset: Problemset;
}

const ProblemsetComponent: React.FC<ProblemsetProps> = ({ problemset }) => {
  // FIXME: Figure out why problemset.getStats() doesn't work.
  const { levels, difficulties, tags } = getStats(problemset);

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

export default ProblemsetComponent;
