import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import Loader from 'react-loader-spinner';
import React from 'react';
export default function Spinner() {
    return (
        <Loader
            type="ThreeDots"
            color="#3266cc"
            height={50}
            width={50}
            // timeout={3000} //3 secs
        />
    );
}