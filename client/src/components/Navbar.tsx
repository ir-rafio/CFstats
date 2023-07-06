import { Box, Button, Flex, FormControl, Input } from '@chakra-ui/react';
import { FormEvent } from 'react';
import { FaHome } from 'react-icons/fa';

const Navbar = () => {
  const handleUserSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const handle = new FormData(e.currentTarget).get('userSearch');
    if (handle) {
      window.location.href = `/user/${handle}`;
    }
  };

  const handleProblemSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const key = new FormData(e.currentTarget).get('problemSearch');
    if (key) {
      window.location.href = `/problem/${key}`;
    }
  };

  const handleContestSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const id = new FormData(e.currentTarget).get('contestSearch');
    if (id) {
      window.location.href = `/contest/${id}`;
    }
  };

  return (
    <Box as="nav" display="flex" alignItems="center">
      <Flex as="ul" listStyleType="none" m={0} p={0} mr="auto">
        <li>
          <Box as="a" href="/" display="flex" alignItems="center" mr={20}>
            <FaHome size={20} />
          </Box>
        </li>
        <li>
          <Box as="a" href="/contest" mr={20}>
            Upcoming Contests
          </Box>
        </li>
      </Flex>
      <Flex as="ul" listStyleType="none" m={0} p={0}>
        <li>
          <form onSubmit={handleUserSearch}>
            <FormControl
              isInvalid={false}
              display="flex"
              alignItems="center"
              mr={20}
            >
              <Input type="text" name="userSearch" placeholder="Search Users" />
              <Button type="submit" ml={2}>
                Go
              </Button>
            </FormControl>
          </form>
        </li>
        <li>
          <form onSubmit={handleProblemSearch}>
            <FormControl
              isInvalid={false}
              display="flex"
              alignItems="center"
              mr={20}
            >
              <Input
                type="text"
                name="problemSearch"
                placeholder="Search Problems"
              />
              <Button type="submit" ml={2}>
                Go
              </Button>
            </FormControl>
          </form>
        </li>
        <li>
          <form onSubmit={handleContestSearch}>
            <FormControl isInvalid={false} display="flex" alignItems="center">
              <Input
                type="text"
                name="contestSearch"
                placeholder="Search Contests"
              />
              <Button type="submit" ml={2}>
                Go
              </Button>
            </FormControl>
          </form>
        </li>
      </Flex>
    </Box>
  );
};

export default Navbar;
