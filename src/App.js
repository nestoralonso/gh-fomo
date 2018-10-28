import React, { useState, useEffect } from 'react';
import './App.css';
import FollowingStarred from './FollowingStarred';


function App() {
  const [ user, setUser ] = useState('nestoralonso');
  const [ searchTerm, setSearchTerm ] = useState(user);

  useEffect(
    () => {
      const query = window.location.search.substr(1);
      const params = new URLSearchParams(query);
      const userName = params.get('user');
      setSearchTerm(userName);
      setUser(userName);
    },
    []
  );
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
      <FollowingStarred user={searchTerm} />
    </div>
  );
}

export default App;
