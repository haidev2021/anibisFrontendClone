import { Route, Switch, NavLink, Link } from 'react-router-dom'
import React, { Component, Fragment, useState, useEffect, useLayoutEffect, useRef, useCallback, useContext, useMemo } from 'react';
import Axios from 'axios';
import { USE_MOCK_DATA, mockStreet, mockCity, mockZip } from '../helper/mockdata';
import { ADDRESS_FIRST_INPUT_OFFSET_Y, COMMON_LAST_INPUT_OFFSET_Y, parseZipCity, trans } from '../../../utils/common';
import { XBASE_COUNTRIES_API } from '../../../utils/network';
import { LocationInsert } from './locationInsert';
import { InsertionContext, ValidationContext } from '../../../screens/insert/insert';
import { getInputClassName } from '../helper/insertHelper';
import './style.css';
import { RootContext } from '../../../root';
import { TLanguage, IXBaseAdvert, IValidationItemInfo, IRootContext, IXBaseCountry } from '../../../utils/xbaseInterface.d';

export interface IInsertionAddress {
    editAdvert: IXBaseAdvert;
    lng: TLanguage;
}
export default function InsertionAddress(props: IInsertionAddress): JSX.Element {
    const { editAdvert, lng } = props;
    const rootContext: IRootContext = useContext(RootContext);
    const validationContext = useContext(ValidationContext);
    const insertionContext = useContext(InsertionContext);
    const [countries, setCountries] = useState(null);
    const phoneCountries = [41, 49, 33, 43, 423, 39];
    const [countryCode, setCountryCode] = useState("CH");
    const [street, setStreet] = useState(USE_MOCK_DATA && !editAdvert ? mockStreet : null);

    const [zip, setZip] = useState<string>(USE_MOCK_DATA && !editAdvert ? mockZip : null);
    const [city, setCity] = useState<string>(USE_MOCK_DATA && !editAdvert ? mockCity : null);
    // const [zipCity, setZipCity] = useState(null);
    const [countryPhoneCode, setCountryPhoneCode] = useState("+41");
    const [phone, setPhone] = useState(null);
    const [contactType, setContactType] = useState(0);
    const CONTACT_TYPE_FORM_ONLY = 0;
    const CONTACT_TYPE_PHONE_ONLY = 1;
    const CONTACT_TYPE_FORM_AND_PHONE = 3;
    const countryListRef = rootContext.countryListRef;

    useEffect(() => {
        const language:TLanguage = lng as TLanguage;
        if (countryListRef.current.get(language) == null)
            Axios.get(XBASE_COUNTRIES_API, { params: { lng: lng } })
                .then(function (response) {
                    countryListRef.current.set(language, response.data.countries);
                    setCountries(response.data.countries);
                }).catch(function (error) {
                    console.log("POST '/countries' ERROR:", error);
                    alert("POST '/countries' ERROR:" + error);
                });
        else
            setCountries(countryListRef.current.get(language));
    }, []);

    useEffect(() => {
        if (editAdvert != null) {
            let editAddress = editAdvert.contactAddress;
            let editPhoneSplitted = editAddress.phone ? editAddress.phone.split(' ') : null;
            setStreet(editAddress.street);
            // setZipCity(editAddress.zip && editAddress.city ? editAddress.zip + " " + editAddress.city : "");
            setZip(editAddress.zip);
            setCity(editAddress.city);
            setCountryPhoneCode(editPhoneSplitted && editPhoneSplitted.length == 2 ? editPhoneSplitted[0] : null);
            setPhone(editPhoneSplitted && editPhoneSplitted.length == 2 ? editPhoneSplitted[1] : null);
            setCountryCode(editAddress.countryCode);
            setContactType(editAddress.contactType);
        }
    }, [editAdvert]);

    const onZipCityChange = useCallback(function (zip: string, city: string): void{
        setZip(zip);
        setCity(city);
    }, []);

    const onKeyBoardInputChange = useCallback((e) => {
        const clickData = e.target.getAttribute('data-click');
        switch (clickData) {
            case "countries":
                setCountryCode(e.target.value);
                break;
            case "street":
                setStreet(e.target.value)
                break;
            case "contact-type":
                setContactType(e.target.value);
                break;
            case "phone-country-code":
                setCountryPhoneCode(e.target.value);
                break;
            case "phone-number":
                setPhone(e.target.value);
                break;
            default:
                break;
        }
    }, [])

    insertionContext.getAddress = useMemo(() => function () {
        // let {zip, city} = parseZipCity(zipCity);
        // console.log('addressCallbackRef zip ', zip, 'city', city)
        let result = {
            street: street,
            zip: zip,
            city: city,
            phone: phone ? countryPhoneCode + " " + phone : "",
            countryCode: countryCode,
            contactType: contactType,
            Latitude: 0,
            Longitude: 0,
            validation: new Array<IValidationItemInfo>(),
        }

        let mandatoryTranslationMap = new Map<any, IValidationItemInfo>([
            ["zip", { name: trans("apps.advertzipcode", insertionContext.textPack), offsetY: ADDRESS_FIRST_INPUT_OFFSET_Y, hasValue: !!zip}],
            ["city", { name: trans("apps.advertcity", insertionContext.textPack), offsetY: ADDRESS_FIRST_INPUT_OFFSET_Y, hasValue: !!city}],
        ]);

        if (contactType > 0) {
            mandatoryTranslationMap.set("phone", { name: trans("apps.phone", insertionContext.textPack), offsetY: COMMON_LAST_INPUT_OFFSET_Y, hasValue: !!phone});
        }
        let validation: Array<IValidationItemInfo> = [];
        Array.from(mandatoryTranslationMap.values()).map(value => {
            if (!value.hasValue)
                validation.push(value);
        })
        result.validation = validation;
        return result;
    }, [street, zip, city, phone, countryPhoneCode, countryCode, contactType, insertionContext.textPack]);

    console.log('render', " addressCallbackRef.current assign");
    console.log('contactType', contactType, contactType == CONTACT_TYPE_FORM_ONLY);
    return <form className="address-form">
        <ul>
            <li className="form-item">
                <label htmlFor="countries">{trans("apps.advertcountry", insertionContext.textPack)}</label>
                {countries && <select className="large" data-click="countries" value={countryCode} onChange={onKeyBoardInputChange}>
                    {countries.map((country: IXBaseCountry) => {
                        return <option key={country.shortCode} value={country.shortCode}>{country.name}</option>
                    })}
                </select>}
                {!countries && <select className="large"></select>}
                {!countries && <div className="loading">loading...</div>}
            </li>

            <LocationInsert onChange={onZipCityChange} countryCode={countryCode.toLowerCase()} editAdvert={editAdvert} />

            <li className="form-item">
                <label htmlFor="street">{trans("apps.advertstreet", insertionContext.textPack) + " " + trans("apps.general.inputoptional", insertionContext.textPack)}</label>
                <input className="large" data-click="street" value={street} onChange={onKeyBoardInputChange}></input>
            </li>
            <li className="form-item">
                <label htmlFor="contact-type">{trans("apps.contacttype", insertionContext.textPack)}</label>
                <select className="large" data-click="contact-type" value={contactType} onChange={onKeyBoardInputChange}>
                    <option value={CONTACT_TYPE_FORM_ONLY}>{trans("apps.contacttypeform", insertionContext.textPack)}</option>
                    <option value={CONTACT_TYPE_PHONE_ONLY}>{trans("apps.contacttypephone", insertionContext.textPack)}</option>
                    <option value={CONTACT_TYPE_FORM_AND_PHONE}>{trans("apps.contacttypeboth", insertionContext.textPack)}</option>
                </select>
            </li>
            <div className="duo-form-items-container" style={{ display: contactType == CONTACT_TYPE_FORM_ONLY ? 'none' : 'flex' }}>
                <li className="form-item">
                <label htmlFor="phone-country-code">{trans("apps.advertcountry", insertionContext.textPack)}</label>
                    <select className="large" data-click="phone-country-code" value={countryPhoneCode} onChange={onKeyBoardInputChange}>
                        {phoneCountries.map(phone => {
                            return <option key={phone} value={"+" + phone}>{"+" + phone}</option>
                        })}
                    </select>
                </li>
                <li className="form-item">
                    <label htmlFor="phone-number">Telefon<span id="mandatory-mark">*</span></label>
                    <input className={getInputClassName(phone, validationContext.isValidating, contactType > 0)} data-click="phone-number" value={phone} onChange={onKeyBoardInputChange}></input>
                    <span id="validation-hint">{trans("apps.new.checkmandatoryfield", insertionContext.textPack)}</span>
                </li>
            </div>
        </ul>
    </form>;
}