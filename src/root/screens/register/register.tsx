import { Route, Switch, NavLink, Link } from 'react-router-dom'
import React, { Component, useState, useEffect, useLayoutEffect, useRef, useCallback, useContext, Dispatch, SetStateAction } from 'react';
import { FromScreen } from '../templates/formScreen';
import { useHistory } from "react-router-dom";
import "./style.css";
import Axios from 'axios';
import { setAuthorizationToken, USER_REGISTER_API, USER_SIGNIN_API } from '../../utils/network';
import { RootContext } from '../../root';
import { useTextPack } from '../../utils/common';
import { IEmailStatus, ILoginInfo, IRootContext, TTextPackId } from '../../utils/xbaseInterface.d';

export interface IRegister {
    emailStatus: IEmailStatus;
    setEmailStatus: Dispatch<SetStateAction<IEmailStatus>>;
    setLoginInfo: Dispatch<SetStateAction<ILoginInfo>>;
}
export default function Register(props: IRegister) {
    const { emailStatus, setEmailStatus, setLoginInfo } = props;
    const rootContext: IRootContext = useContext(RootContext);

    console.log("validateEmail Register emailStatus = ", emailStatus);
    const history = useHistory();
    // const email = emailStatus.email;
    // const isRegistered= emailStatus.isRegistered;
    const [password, setPassword] = useState('123');
    const [showPasword, setShowPasword] = useState<boolean>(false);
    const textPack = useTextPack(rootContext, "LOGIN_REGISTER" as TTextPackId);

    const register = useCallback(() => {
        console.log("register pressed");
        Axios.post(USER_REGISTER_API, {
            email: emailStatus.email,
            password: password
        })
            .then(function (response) {
                console.log("register", response);
                alert(response.data.emailStatus.memberSince ? `your are signed-Up!` : `signUp failed!`);
                setEmailStatus(response.data.emailStatus);
                localStorage.setItem('savedEmail',  emailStatus.email);
                history.push("/login");
            })
            .catch(function (error) {
                // console.log(error);
                alert(`signUp catch ${error}`);
            });
    }, [emailStatus, password, setEmailStatus, history]);

    const signIn = useCallback(() => {
        // var axios = require('axios');
        // console.log('In Render');
        // alert('Email address is ' + this.state.email + ' Password is ' + this.state.password);
        Axios.post(USER_SIGNIN_API, {
            email: emailStatus.email,
            password: password
        })
            .then(function (response) {
                console.log("signIn response = ", response);
                if (response.data.loginInfo.token) {
                    localStorage.setItem('anibisloginInfo', JSON.stringify(response.data.loginInfo));
                    setAuthorizationToken(response.data.loginInfo.token);
                    setLoginInfo(response.data.loginInfo);
                    history.push("/user");
                } else {
                    alert('Login failed, please try again!');
                }
            })
            .catch(function (error) {
                console.log("catch error", error);
                alert("catch error" + JSON.stringify(error));
            });
    }, [emailStatus, password, setLoginInfo, history]);

    const onDoneClick = useCallback((e) => {
        e.preventDefault();
        if (emailStatus.memberSince) {
            signIn();
        } else {
            register();
        }
    }, [emailStatus && emailStatus.memberSince, register, signIn]);

    const onEmailChange = useCallback(() => {
    }, []);

    const onPasswordChange = useCallback((event) => {
        setPassword(event.target.value)
    }, []);

    const t = useCallback(function (key) {
        return textPack && textPack.has(key) ? textPack.get(key) : key;
    }, [textPack]);

    const tooglePasswordVisibility = useCallback((e) => {
        e.preventDefault();
        setShowPasword(show => !show);
    }, []);

    return <FromScreen className="route-register" textPack={textPack}
        primaryButtonText={emailStatus && emailStatus.memberSince ? t("apps.action.login") : t("apps.action.createaccount")}
        onPrimaryButtonClick={onDoneClick}>
        <h1 className="form-title">{emailStatus && emailStatus.memberSince ? t("apps.action.login") : t("apps.action.createaccount")}</h1>
        <div className="group-containter">
            <label htmlFor="email">{t("apps.email")}</label>
            <input className="large match-parent-width email" value={emailStatus && emailStatus.email} onChange={onEmailChange} readOnly={true}></input>
            <button className="change-email link-button non-material small white">{t("apps.action.change")}</button>
        </div>
        <div className="group-containter">
            <label htmlFor="password">{t("apps.password")}</label>
            <input className="small match-parent-width validating-fail" value={password} onChange={onPasswordChange} type={showPasword ? "text" : "password"}></input>
            <Link to="" className="password-visible simple-link" onClick={tooglePasswordVisibility}>{t(showPasword ? "apps.action.hidepassword" : "apps.action.revealpassword")}</Link>
            <span className="validation-error">{t("apps.new.checkmandatoryfield")}</span>
        </div>
    </FromScreen>;
}