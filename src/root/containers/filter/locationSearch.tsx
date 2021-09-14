import { Route, Switch, NavLink, Link } from 'react-router-dom'
import React, { Component, useState, useEffect, useLayoutEffect, useRef, useCallback, Fragment, useContext, Dispatch, SetStateAction } from 'react';
import Axios from 'axios';
import { getInputClassName } from '../insert/helper/insertHelper';
import { XBASE_LOCATION_SUGGESTION_API } from '../../utils/network';
import { ValidationContext } from '../../screens/insert/insert';
import { RootContext } from '../../root';
import { trans } from '../../utils/common';
import { IRootContext } from '../../utils/xbaseInterface.d';
function toTitleCase(str: string): string {
    return str.split(' ')
        .map(w => w[0].toUpperCase() + w.substr(1).toLowerCase())
        .join(' ')
}
export interface ILocationSearch {
    onChange: Dispatch<SetStateAction<string>>;
    value: string;
    isSearch: boolean;
}
export function LocationSearch(props: ILocationSearch) {
    const {onChange, value, isSearch} = props;
    const validationContext = useContext(ValidationContext);
    const rootContext: IRootContext = useContext(RootContext);
    const [locationSuggestions, setLocationSuggestions] = useState<Array<string>>(null);
    const [location, setLocation] = useState(null);
    const locationRef = useRef(null);

    const onSuggestionClick = useCallback(e => {
        const loc = e.target.getAttribute('data-click')
        setLocation(loc);
        onChange(loc);
        setLocationSuggestions(null);
    }, [onChange]);

    useEffect(() => {
        setLocation(value);
    }, [value])

    const onLocationChange = useCallback(e => {
        console.log('onLocationChange', e.target.value)
        setLocation(e.target.value);
        locationRef.current = e.target.value;
        const requestTrigger = e.target.value;
        if (!requestTrigger) {
            setLocationSuggestions(null);
            onChange(null);
        } else {
            setTimeout(function () {
                console.log('locationSuggestion requestTrigger', requestTrigger, "location", location)
                console.log('LocationSearch language', rootContext.language)
                if (locationRef.current === requestTrigger)
                    Axios.get(XBASE_LOCATION_SUGGESTION_API, {
                        params: {language: rootContext.language, prefix: requestTrigger,}
                    })
                        .then(function (response) {
                            console.log(`POST /locationSuggestion RESPONSE = `, response.data);
                            // setCurrentPageDetails(response.data);
                            let fixedCaseList: Array<string> = [];
                            if (response.data)
                                fixedCaseList = Array.from(response.data, (item: string) => toTitleCase(item));
                            setLocationSuggestions(fixedCaseList);
                        })
                        .catch(function (error) {
                            console.log(`POST /locationSuggestion ERROR:`, error);
                            // alert(`POST /fetchDetails ERROR:` + error);
                        });
            }, 750);
        }
    }, [location, onChange, rootContext.language]);

    let label = <label htmlFor="contact-type">{trans("apps.advertcity", rootContext.commonTexts)}</label>;
    let inputClassName = isSearch ? "large" : getInputClassName(!location ? value : location, validationContext.isValidating, true);

    // if (isSearch)
    return <div className="form-item p-relative">
        {label}
        <input className={inputClassName} value={location} onChange={onLocationChange} autoComplete="off"></input>
        <div className="dropdown-content" id="location-suggestions" style={{ display: locationSuggestions ? 'block' : 'none' }}>
            {locationSuggestions && locationSuggestions.map((item: string) => <span className="simple-link" data-click={item} onClick={onSuggestionClick}>
                {item.substring(0, location.length)}<span className="suggestion-non-prefix" data-click={item} >{item.substring(location.length, item.length)} </span>
            </span>)}
        </div>
    </div>
}