import React, { useState, useEffect, Suspense } from 'react';
import useLocalStorage from './useLocalStorage';
import './App.css';

const FollowingStarred = React.lazy(() => import('./FollowingStarred'));

function App() {
  const [ user, setUser ] = useState('');
  const [ searchTerm, setSearchTerm ] = useLocalStorage('searchTerm', '');

  useEffect(
    () => {
      // Copy the user from the URL to the state if it is present
      const query = window.location.search.substr(1);
      const params = new URLSearchParams(query);
      const userName = params.get('user');

      if (!userName) return;
      setSearchTerm(userName);
      setUser(userName);
    },
    []
  );

  useEffect(() => {
    if (searchTerm && !user) {
      setUser(searchTerm);
    }
  }, []);

  const handleChangeUser = (e) => {
    const value = e.target.value;
    setUser(value);
  };

  const handleSearchClick = (e) => {
    e.preventDefault();
    setSearchTerm(user);
  }

  return (
    <div className="App">
      <h1>GH FOMO</h1>
        <div className="center">
          <form onSubmit={handleSearchClick} className="search-box">
            <label>User:<input type="text" value={user} onChange={handleChangeUser} /></label>
            <button>Go</button>
          </form>
        </div>

        <Suspense fallback="loading ...">
          {searchTerm && <FollowingStarred user={searchTerm} />}
        </Suspense>
    </div>
  );
}

export default App;
