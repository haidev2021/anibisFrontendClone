import { Route, Switch, NavLink, Link } from 'react-router-dom'
import React, { Component, useState, useEffect, useLayoutEffect, useRef, useCallback, Fragment, useContext } from 'react';
import Axios from 'axios';
import { getInputClassName } from '../helper/insertHelper';
import { parseZipCity, trans } from '../../../utils/common';
import { XBASE_LOCATION_SUGGESTION_API } from '../../../utils/network';
import InsertionAddress from './insertionAddress';
import { InsertionContext, ValidationContext } from '../../../screens/insert/insert';
import { IXBaseAdvert } from '../../../utils/xbaseInterface.d';
function toTitleCase(str: string) {
    return str.split(' ')
        .map(w => w[0].toUpperCase() + w.substr(1).toLowerCase())
        .join(' ')
}

export interface ILocationInsert {
    editAdvert: IXBaseAdvert;
    onChange: (zip: string, city: string) => void;
    countryCode: string;
}

export function LocationInsert(props: ILocationInsert): JSX.Element {
    const { editAdvert, onChange, countryCode } = props;
    const insertionContext = useContext(InsertionContext);
    const validationContext = useContext(ValidationContext);
    const [locationSuggestions, setLocationSuggestions] = useState(null);
    const [zip, setZip] = useState(null);
    const [city, setCity] = useState(null);
    const locationRef = useRef(null);

    useEffect(() => {
        if (editAdvert != null) {
            let editAddress = editAdvert.contactAddress;
            setZip(editAddress.zip);
            setCity(editAddress.city);
        }
    }, [editAdvert]);

    const onSuggestionClick = useCallback(e => {
        const loc = e.target.getAttribute('data-click')
        let { zip, city } = parseZipCity(loc);
        console.log('LocationInsert zip ', zip, 'city', city)
        setZip(zip);
        setCity(city);
        onChange("" + zip, city);
        setLocationSuggestions(null);
    }, [onChange]);

    const onCityChange = useCallback(e => {
        setCity(e.target.value);
    }, []);
    const onZipChange = useCallback(e => {
        console.log('onZipChange', e.target.value)
        setZip(e.target.value);
        locationRef.current = e.target.value;
        const requestTrigger = e.target.value;
        if (!requestTrigger) {
            setLocationSuggestions(null);
            onChange(null, null);
        } else {
            setTimeout(function () {
                console.log('locationSuggestion requestTrigger', requestTrigger, "zip", zip)
                console.log('LocationSearch countryCode', countryCode)
                if (locationRef.current === requestTrigger)
                    Axios.get(XBASE_LOCATION_SUGGESTION_API, {
                        params: {
                            countryCode: countryCode,
                            prefix: requestTrigger,
                        }
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
    }, [countryCode, onChange, zip]);
    console.log('countryCode', countryCode)
    const isCityReadOnly = countryCode === "vn" || countryCode === "ch";
    return <div className="duo-form-items-container">
        <li className="form-item">
            <label htmlFor="zip">{trans("apps.advertzipcode", insertionContext.textPack)}<span id="mandatory-mark">*</span></label>
            <input type="number" className={getInputClassName(zip, validationContext.isValidating, true)} id="zip" value={zip} onChange={onZipChange} autoComplete="off"></input>
            <span id="validation-hint">{trans("apps.new.checkmandatoryfield", insertionContext.textPack)}</span>
            <div className="dropdown-content" id="location-suggestions" style={{ display: locationSuggestions ? 'block' : 'none' }}>
                {locationSuggestions && locationSuggestions.map((item: string) => <span className="simple-link" data-click={item} onClick={onSuggestionClick}>
                    {item.substring(0, zip.length)}<span className="suggestion-non-prefix" data-click={item} >{item.substring(zip.length, item.length)} </span>
                </span>)}
            </div>
        </li>
        <li className="form-item">
            <label htmlFor="city">{trans("apps.advertcity", insertionContext.textPack)}<span id="mandatory-mark">*</span></label>
            <input className={getInputClassName(city, validationContext.isValidating, true)} id="city" value={city} onChange={onCityChange} readOnly={isCityReadOnly} autoComplete="off"></input>
            <span id="validation-hint">{trans("apps.new.checkmandatoryfield", insertionContext.textPack)}</span>
        </li>
    </div>
}