import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import PlaceList from '../components/PlaceList';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useHttpClient } from '../../shared/hooks/http-hook';
import Constants from '../../shared/util/Constants';

const UserPlaces = () => {
  const userId = useParams().userId;
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [ loadedPlaces, setLoadedPlaces ] = useState();
  
  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const responseData = await sendRequest(`${Constants.HOME_URL}api/places/user/${userId}`);
        setLoadedPlaces(responseData.places);
      } catch(err) {};
    };
    fetchPlaces();
  }, [sendRequest, userId]);

  const placeDeletedHandler = deletedPlaceId => {
    setLoadedPlaces(previousPlaces => previousPlaces.filter(p => p.id !== deletedPlaceId));
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (<div className='center'><LoadingSpinner asOverlay /></div>)}
      {!isLoading && loadedPlaces && <PlaceList items={loadedPlaces} onDeletePlace={placeDeletedHandler} />}
    </React.Fragment>
  );
};

export default UserPlaces;
