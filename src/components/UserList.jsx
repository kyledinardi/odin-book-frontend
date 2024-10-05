import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import User from './User.jsx';

function UserList() {
  const [users, setUsers] = useState(null);
  const [followedIds, setFollowedIds] = useState(null);
  const [currentUser, setCurrentUser] = useOutletContext();

  useEffect(() => {
    if (currentUser) {
      fetch('http://localhost:3000/users', {
        mode: 'cors',

        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
        .then((response) => response.json())
        .then((response) => {
          setFollowedIds(currentUser.following.map((user) => user.id));
          setUsers(response.users);
        });
    }
  }, [currentUser]);

  return !users || !followedIds ? (
    <h1>Loading...</h1>
  ) : (
    <main>
      {users.map((user) => (
        <User
          key={user.id}
          user={user}
          isFollowed={!!followedIds.includes(user.id)}
          replaceUser={(updatedUser) =>
            setCurrentUser({ ...currentUser, following: updatedUser.following })
          }
        />
      ))}
    </main>
  );
}

export default UserList;
