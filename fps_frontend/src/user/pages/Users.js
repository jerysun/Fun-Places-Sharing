import React, { useEffect, useState } from 'react';

import UsersList from '../components/UsersList';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

const Users = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(); // or useState(undefined); or useState('');
  const [loadedUsers, setLoadedUsers] = useState(); // or useState(undefined);

  // Dependencies array being empty means it only runs ONCE - never reruns. That
  // is just what we need, we just want it to run at the first loading phase.
  // Without the wrapper useEffect(), you'll find the fecth method will be called
  // at least TWICE.

  // The callback including the lambda as the argument of useEffect() shouldn't
  // use async as a qualifier, because we don't want it to reutrn a promise,
  // which is against what useEffect() expects here.
  useEffect(() => {
    // NO async() => {} here. But we can have a trick - use it inside
    const sendRequest = async () => {
      try {
        setIsLoading(true);
        // with fetch(), the default request type is a GET request)
        const response = await fetch('http://localhost:5000/api/users');
        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.message);
        }
        setLoadedUsers(responseData.users);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    sendRequest();
  }, []);

  const errorHandler = () => setError(null);

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={errorHandler} />
      {isLoading && (
        <div className='center'><LoadingSpinner asOverlay /></div>
      )}
      {!isLoading && loadedUsers && <UsersList items={loadedUsers} />}
    </React.Fragment>
  );
};

export default Users;
