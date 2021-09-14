import { Route, Switch, NavLink, Link } from 'react-router-dom'
import React, { Component, useState, useEffect, useLayoutEffect, useRef, useCallback, useContext, SetStateAction, Dispatch } from 'react';
import { FromScreen } from '../templates/formScreen';
import { useHistory } from "react-router-dom";
import "./user.css";
import Axios from 'axios';
import { setAuthorizationToken, USER_VERIFY_TOKEN_API } from '../../utils/network';
import { RootContext } from '../../root';
import { useTextPack } from '../../utils/common';
import { ILoginInfo, IRootContext, TTextPackId } from '../../utils/xbaseInterface.d';

export interface IUser {
    loginInfo: ILoginInfo;
    setLoginInfo: Dispatch<SetStateAction<ILoginInfo>>;
}

export default function User(props: IUser): JSX.Element {
    const {setLoginInfo, loginInfo} = props;
    const rootContext: IRootContext = useContext(RootContext);
    const textPack = useTextPack(rootContext, "ACCOUNT" as TTextPackId);
    const history = useHistory();

    const onLogoutClick = useCallback(function (e) {
        e.preventDefault();
        localStorage.removeItem('anibisloginInfo');
        setAuthorizationToken(null);
        setLoginInfo(null);
        history.push("/");
    }, [history, setLoginInfo]);
    
    const onTestJWTClick = useCallback(function (e) {
        e.preventDefault();
        Axios.post(USER_VERIFY_TOKEN_API, {
            token: JSON.parse(localStorage.getItem('anibisloginInfo')).token
        })
            .then(function (response) {
                alert(response.data.loginInfo ? 'token: real' : 'token: fake');
            })
            .catch(function (error) {
                console.log("catch error", error);
                alert("catch error" + JSON.stringify(error));
            });
    }, []);

    const onInsertClick = useCallback(function (e) {
        e.preventDefault();
        history.push("/insert");
    }, [history]);

    const t = useCallback(function (key) {
        return textPack && textPack.has(key) ? textPack.get(key) : key;
    }, [textPack]);

    return <FromScreen className="route-user" textPack={textPack} primaryButtonText={t("apps.action.logout")} onPrimaryButtonClick={onLogoutClick}>
        <h1 className="form-title">{t("apps.account.signedinas")}</h1>
        <div className="group-containter">
            {t("apps.email")}: {loginInfo.email}
        </div>
        <div className="group-containter">
            {t("apps.registeredsince")}: {loginInfo.memberSince}
        </div>
        {/* <div className="group-containter">
                    <button className="link-button non-material small white" onClick={onTestJWTClick}>Test JWT</button>
                </div> */}
        <div className="group-containter">
            <button className="link-button non-material small green mt16" onClick={onInsertClick}>{t("apps.createlistings")}</button>
        </div>
    </FromScreen>
}