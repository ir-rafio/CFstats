import { Problem } from '../api/interfaces';

import { Box, Flex, Text } from '@chakra-ui/react';

const getProblemLevel = (index: string): string => {
  return index && index[0].match(/[A-Za-z]/) ? index[0].toUpperCase() : '0';
};

export const parseProblemset = (problems: Problem[]) => {
  const levels: Record<string, number> = {};
  const difficulties: Record<string, number> = {};
  const tags: Record<string, number> = {};

  for (const problem of problems) {
    const level = getProblemLevel(problem.index);
    const difficulty = problem.difficulty ?? 'Unknown';

    levels[level] = levels[level] + 1 || 1;
    difficulties[difficulty] = difficulties[difficulty] + 1 || 1;
    for (const tag of problem.tags) tags[tag] = tags[tag] + 1 || 1;
  }

  const sortedLevels = Object.fromEntries(Object.entries(levels).sort());
  const sortedDifficulties = Object.fromEntries(
    Object.entries(difficulties).sort()
  );
  const sortedTags = Object.fromEntries(
    Object.entries(tags).sort((a, b) => b[1] - a[1])
  );

  return {
    problems,
    levels: sortedLevels,
    difficulties: sortedDifficulties,
    tags: sortedTags,
  };
};

export const renderBarGraph = (
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
        maxWidth={graphWidth}
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
