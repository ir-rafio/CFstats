import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ContestComponent from './contest/contest.component';
import ProblemComponent from './problem/problem.component';
import UserComponent from './user/user.component';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/user/:handle" element={<UserComponent />} />
        <Route path="/problem/:key" element={<ProblemComponent />} />
        <Route path="/contest/:id" element={<ContestComponent />} />
        <Route
          path="/"
          element={
            <div className="App">
              <h1>App</h1>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
