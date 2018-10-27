import React, { useState } from 'react';
import './App.css';
import FollowingStarred from './FollowingStarred';


function App() {
  const [ user, setUser ] = useState('kelseyhightower');
  const [ searchTerm, setSearchTerm ] = useState(user);
  const handleChangeUser = (e) => {
    const value = e.target.value;
    setUser(value);
  };

  const handleSearchClick = () => {
    setSearchTerm(user);
  }

  return (
    <div className="App">
      <h1>Github Fan</h1>

      <div className="center">
        <div className="search-box">
          <label>User:<input type="text" value={user} onChange={handleChangeUser} /></label>
          <button onClick={handleSearchClick} type="button">Go</button>
        </div>
      </div>
      <FollowingStarred user={searchTerm} />
    </div>
  );
}

export default App;
