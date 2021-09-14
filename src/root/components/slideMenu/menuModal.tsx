
import { Link } from 'react-router-dom'
import React, { useCallback, useContext } from 'react';
import { onDummyClick, trans } from '../../utils/common';
import { RootContext } from '../../root';
import { NullableIRootContext } from '../../utils/xbaseInterface.d';
interface IMenuModal {
    isOpen: boolean;
    onXClick: (props: any) => void;
    onAuthorizedMenuClick: (props: any) => void;
}
export default function MenuModal(props: IMenuModal) {
    const { isOpen, onXClick, onAuthorizedMenuClick } = props;
    const rootContext = useContext(RootContext) as NullableIRootContext;
    let texts = rootContext && rootContext.commonTexts;
    let loginInfo = rootContext && rootContext.loginInfo;
    let $close = trans("apps.action.close", texts);
    let $search = trans("apps.action.nav.search", texts);
    let $login = trans("apps.action.nav.login", texts);
    // let $account = trans("apps.action.nav.account", texts);
    let $insertNew = trans("apps.action.nav.insert", texts);
    let $listings = trans("apps.action.nav.listings", texts);
    let $favorites = trans("apps.action.nav.favorites", texts);

    const onCommonItemClick = useCallback((e) => {
        onXClick(e);
        if (e.target.getAttribute('data-click')) {
            onAuthorizedMenuClick(e);
        }
    }, [onAuthorizedMenuClick, onXClick]);

    return <div className="modal-container" style={{ display: isOpen ? 'block' : 'none' }} onClick={onXClick}>
        <div className="modal-content" id="slide-menu" onClick={onDummyClick}>

            <div className="modal-header">
                <button className="simple-link x-mark" onClick={onXClick}><span className="backgrounded-span close-icon after">{$close}</span></button>
            </div>

            <ul className="modal-chunk main-menu">
                <ul>
                    <li><Link to="/" className="link-icon search" onClick={onCommonItemClick}>{$search}</Link></li>
                    <li><Link to={loginInfo ? "/user" : "/login"} className="link-icon login dropbtn">{loginInfo ? loginInfo.email : $login}</Link></li>
                    <li><Link to="/" className="link-icon insert-new" data-click="newInsert" onClick={onCommonItemClick}>{$insertNew}</Link></li>
                    {loginInfo && <li><Link to="/" className="link-icon listing" data-click="myadverts" onClick={onCommonItemClick}>{$listings}</Link></li>}
                    {loginInfo && rootContext && rootContext.favoriteIds.length > 0 && <li><Link to="/" className="link-icon favorite" data-click="favorites" onClick={onCommonItemClick}>{$favorites} <span className="menu-count">{rootContext.favoriteIds.length}</span></Link></li>}
                </ul>
            </ul>
        </div>
    </div>;
}