import { Divider } from '@chakra-ui/react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ContestComponent from './contest/contest-details.component';
import ContestTable from './contest/contest-table.component';
import ProblemComponent from './problem/problem.component';
import UserComponent from './user/user.component';

const App = () => {
  return (
    <>
      <Navbar />

      <Divider />

      <BrowserRouter basename="/">
        <Routes>
          <Route index element={<ContestTable />} />
          <Route path="/user/:handle" element={<UserComponent />} />
          <Route path="/problem/:key" element={<ProblemComponent />} />
          <Route path="/contest/:id" element={<ContestComponent />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
