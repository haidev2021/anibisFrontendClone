import { Route, Switch, NavLink, Link } from 'react-router-dom'
import React, { Component, useState, useEffect, useLayoutEffect, useRef, useCallback, useContext, Dispatch, SetStateAction } from 'react';
import "./style.css";
import Axios from 'axios';
import { useHistory } from "react-router-dom";
import { useTextPack } from '../../utils/common';
import { USER_VALIDATE_EMAIL_API } from '../../utils/network';
import { RootContext } from '../../root';
import { FromScreen } from '../templates/formScreen';
import { IEmailStatus, IRootContext, TTextPackId } from '../../utils/xbaseInterface.d';
export interface ILogin {
    setEmailStatus: Dispatch<SetStateAction<IEmailStatus>>;
}
export default function Login(props: ILogin) {
    const { setEmailStatus } = props;
    const rootContext: IRootContext = useContext(RootContext);
    const history = useHistory();
    const [fetchedFlag, seFetchedFlag] = useState<boolean>(false);
    const [email, setEmail] = useState("haihaihai@gmail.com");
    const textPack = useTextPack(rootContext, "LOGIN_REGISTER" as TTextPackId);
    let savedEmail = localStorage.getItem('savedEmail');

    useEffect(() => {
        if (savedEmail)
            setEmail(savedEmail);
    }, [savedEmail]);

    const handleOnEmailChange = useCallback((e) => {
        console.log("handleOnNextClick e.target.value = ", e.target.value);
        setEmail(e.target.value);
    }, [])

    useEffect(() => {
        if (fetchedFlag)
            history.push("/register");
    }, [fetchedFlag, history]);

    const t = useCallback(function (key) {
        return textPack && textPack.has(key) ? textPack.get(key) : key;
    }, [textPack]);

    const handleOnNextClick = useCallback(function (e) {
        e.preventDefault();
        console.log("handleOnNextClick Axios post email = ", email);
        Axios.post(USER_VALIDATE_EMAIL_API, {
            email: email
        })
            .then(function (response) {
                setEmailStatus(response.data.emailStatus);
                seFetchedFlag(true);
            })
            .catch(function (error) {
                console.log("handleOnNextClick", error);
                alert("catch error " + error);
            });
    }, [email, setEmailStatus]);

    return <FromScreen className="route-login" textPack={textPack}>
        <h1 className="form-title">{`${t("apps.action.login",)} / ${t("apps.action.createaccount")}`}</h1>
        <label htmlFor="email">{t("apps.email")}</label>
        <input className="small" value={email} onChange={handleOnEmailChange} ></input>
        <button className="go-next link-button non-material blue small match-parent-width" onClick={handleOnNextClick}>{t("apps.action.continue")}</button>
        <Link className="simple-link no-account-yet" to="/register">{t("apps.message.noaccount")}</Link>
    </FromScreen>;
}