import { ContestInfo } from '../api/interfaces';

import { Link } from '@chakra-ui/react';

interface ContestRowProps {
  contest: ContestInfo;
}

const ContestRow: React.FC<ContestRowProps> = ({ contest }) => {
  return (
    <tr key={contest.id}>
      <td>
        <Link href={`contest/${contest.id}`}>{contest.name}</Link>
      </td>
      <td>
        {contest.startTimeSeconds
          ? new Date(contest.startTimeSeconds * 1000).toLocaleString()
          : 'To be announced'}
      </td>
    </tr>
  );
};

export default ContestRow;
