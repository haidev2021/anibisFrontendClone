import { Route, Switch, NavLink, Link } from 'react-router-dom'
import React, { Component, useState, useEffect, useLayoutEffect, useRef, useCallback, Fragment, useContext } from 'react';
import { useHistory } from "react-router-dom";
import anibisLogo from '../../files/anibis-logo.svg';
import "./style.css";
import { RootContext } from '../../root';
import { trans } from '../../utils/common';
import { TTextPack, IRootContext } from '../../utils/xbaseInterface.d';

export interface IFormHeader {
    textPack: TTextPack;
}
export function FormHeader(props: IFormHeader): JSX.Element {
    const { textPack } = props;
    const history = useHistory();
    const onBackClick = useCallback(function (e) {
        history.goBack();
    }, [history]);

    const t = useCallback(function (key) {
        return textPack && textPack.has(key) ? textPack.get(key) : key;
    }, [textPack]);

    return <Fragment>
        <header className="form-header">
            <Link to="/" id="logo" className="link-logo left" ><img src={anibisLogo} /></Link>
            <button id="back" onClick={onBackClick} className="link-button non-material small white right">{t("apps.action.back")}</button>
        </header>
        <hr className="thin no-margin" />
    </Fragment>;
}

export function FormFooter(props: any): JSX.Element {
    const rootContext: IRootContext = useContext(RootContext);

    const getLangugleLinkClass = useCallback((lng) => {
        return "simple-link" + (rootContext.language === lng ? " selected" : "");
    }, [rootContext.language]);

    const onLanguageClick = useCallback((e) => {
        e.preventDefault();
        rootContext.setLanguage(e.target.innerText);
    }, [rootContext]);

    return <Fragment>
        <footer className="form-footer">
            <hr className="thick no-margin" />
            <ul className="langs match-parent-width">
                <li ><span className="large">{trans("apps.settings", rootContext.commonTexts)}:</span></li>
                <li ><Link to="" onClick={onLanguageClick} className={getLangugleLinkClass("en")}>en</Link></li>
                <li className="separator" >|</li>
                <li ><Link to="" onClick={onLanguageClick} className={getLangugleLinkClass("de")}>de</Link></li>
                <li className="separator" >|</li>
                <li ><Link to="" onClick={onLanguageClick} className={getLangugleLinkClass("fr")}>fr</Link></li>
                <li className="separator" >|</li>
                <li ><Link to="" onClick={onLanguageClick} className={getLangugleLinkClass("it")}>it</Link></li>
            </ul>
            <div className="tacenter"><span className="small">{trans("apps.footer.responsibility", rootContext.commonTexts)}</span></div>
            <div className="tacenter"><span className="small">{trans("apps.footer.copyright", rootContext.commonTexts)}</span></div>
        </footer>
    </Fragment>;
}
export interface IFromScreen {
    className: string;
    textPack: TTextPack;
    children: any;
    primaryButtonText?: string;
    onPrimaryButtonClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}
export function FromScreen(props: IFromScreen) {
    const { className, textPack, children, primaryButtonText, onPrimaryButtonClick } = props;
    const history = useHistory();

    const onCancelClick = useCallback((e) => {
        e.preventDefault();
        history.goBack();
    }, [history]);

    return <div className={className + " form-screen"}>
        <FormHeader textPack={textPack} />
        <form className="headered-form">
            {children}
            {primaryButtonText && onPrimaryButtonClick &&
                <div className="action-group-containter">
                    <button className="cancel link-button non-material small lightgray" onClick={onCancelClick}>{trans("apps.action.cancel", textPack)}</button>
                    <button className="go-next link-button non-material small blue" onClick={onPrimaryButtonClick}>{primaryButtonText}</button>
                </div>}
        </form>
        <FormFooter textPack={textPack} />
    </div>;
}