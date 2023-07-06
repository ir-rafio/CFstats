import { Divider } from '@chakra-ui/react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ContestComponent from './contest/contest-details.component';
import ContestTable from './contest/contest-table.component';
import ProblemComponent from './problem/problem.component';
import './styles.css';
import UserComponent from './user/user.component';

const App = () => {
  return (
    <>
      <Navbar />

      <Divider />

      <BrowserRouter basename="/">
        <Routes>
          <Route path="/user/:handle" element={<UserComponent />} />
          <Route path="/problem/:key" element={<ProblemComponent />} />
          <Route path="/contest/" element={<ContestTable />} />
          <Route path="/contest/:id" element={<ContestComponent />} />
          <Route
            path="/"
            element={
              <div className="App">
                <h1>Welcome to CF Stats</h1>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
