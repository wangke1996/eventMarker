import React from 'react';
import {Route, Redirect} from 'react-router-dom';

export const PrivateRoute = ({component: Component, isloggedin: isLoggedIn, ...rest}) => (

    <Route
        {...rest}
        render={props => isLoggedIn ? (<Component/>) : (<Redirect
            to={{
                pathname: "/",
                state: {from: props.location}
            }}
        />)
        }
    />
);