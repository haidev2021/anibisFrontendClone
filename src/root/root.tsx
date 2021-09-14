import React, { Component, Suspense, lazy, useState, useEffect, useLayoutEffect, useRef, useCallback, useContext, useMemo, MutableRefObject } from 'react';
import anibisLogo from './files/anibis-logo.svg';
import './root.css';
import './responsive.css';
import './base64.css';
import { BrowserRouter, HashRouter, Route, Link, Switch } from "react-router-dom";
import { useHistory, useLocation } from "react-router-dom";
import Axios from 'axios';
import { ADVERT_FAVORITE_IDS_API, ADVERT_MY_ADVERT_IDS_API, ADVERT_MY_ADVERT_IDS_FOR_ADMIN_API, ADVERT_SEARCH_API, setAuthorizationToken, USER_FAVORITE_LOCAL_SYNC_API } from './utils/network';
// import { USE_MOCK_DATA } from './insert/mockdata';
import { trans, useTextPack, useWindowInnerSize } from './utils/common';
// import SearchResults from './screens/searchResults/searchResults';
import MenuModal from './components/slideMenu/menuModal';
import { FormFooter } from './screens/templates/formScreen';
import { IRootContext, IXBaseAdvert, TLanguage, IXBaseCountry, IXBaseAttribute, ILoginInfo, IEmailStatus, IXBaseCategory, TTextPackId } from './utils/xbaseInterface.d';

const Home = lazy(() => import('./screens/home/home'));
const Login = lazy(() => import('./screens/login/login'));
const Register = lazy(() => import('./screens/register/register'));
const Insert = lazy(() => import('./screens/insert/insert'));
const SearchResults = lazy(() => import('./screens/searchResults/searchResults'));
const User = lazy(() => import('./screens/user/user'));
const MyAdverts = lazy(() => import('./screens/myadverts/myAdverts'));
const DetailBrowser = lazy(() => import('./screens/detailBrowser/detailBrowser'));
const Favorites = lazy(() => import('./screens/favorites/favorites'));
const AUTHORIZED_MENUS: string[] = ["user", "myadverts", "newInsert"];

export const RootContext = React.createContext(null);

const LNG = "de";
function Root(props: any) {
    const routerLocation = useLocation();
    const history = useHistory();
    const [width, height] = useWindowInnerSize();
    const [menuOpen, setMenuOpen] = useState<boolean>(false);
    const [emailStatus, setEmailStatus] = useState<IEmailStatus>(null);
    const initLoginInfo = useMemo(function () {
        let info:ILoginInfo = JSON.parse(localStorage.getItem('anibisloginInfo')) as ILoginInfo;
        return info;
    }, [])
    const [loginInfo, setLoginInfo] = useState<ILoginInfo>(initLoginInfo);
    const initLanguage = useMemo<TLanguage>(function () {
        let lang = localStorage.getItem('language');
        return (lang ? lang : "de") as TLanguage;
    }, [])
    const [language, setLanguage] = useState<TLanguage>(initLanguage);
    const textPack = useTextPack({ language: language }, "ROOT" as TTextPackId );
    const subCategoryCacheRef = useRef<Map<TLanguage, Map<number, Array<IXBaseCategory>>>>(new Map());
    const categoryAttributesCacheRef = useRef<Map<TLanguage, Map<number, Array<IXBaseAttribute>>>>(new Map());
    const countryListRef = useRef<Map<TLanguage, Array<IXBaseCountry>>>(new Map());
    const editAdvertRef = useRef<IXBaseAdvert>();
    const [favoriteIds, setFavoriteIds] = useState<Array<string>>(() => {
        const saveList = localStorage.getItem('anibisLocalFavorites');
        console.log('saveList', saveList)
        return saveList ? JSON.parse(saveList) : [];
    });
    const [disableScrollY, setDisableScrollY] = useState<boolean>(false);
    const [pageYOffset, setPageYOffset] = useState(null);
    const searchResultIdsRef = useRef<string[]>([]);
    const detailPreviousPathRef = useRef<string>("");
    // const [modalOpenPrepare, setModalOpenPrepare] = useState<boolean>(false);
    // const [favorites, setFavorites] = useState([]);
    const openMenu = useCallback((e) => {
        setMenuOpen(true);
    }, [])
    const closeMenu = useCallback((e) => {
        setMenuOpen(false);
    }, [])

    const onlanguagechange = useCallback((e) => {
        setLanguage(e.target.value);
    }, []);

    const searchMenuSelected = routerLocation.pathname.split('/')[1] === "";
    const favoriteMenuSelected = routerLocation.pathname.split('/')[1] === "favorites";

    useEffect(() => {
        function fetchRemoteFavoriteIds() {
            Axios.post(ADVERT_FAVORITE_IDS_API, {})
                .then(response => {
                    console.log('/favoriteIds response.data', response.data)
                    setFavoriteIds(Array.from(response.data));
                    // setFavorites(response.data);
                }).catch(err => {
                    alert(err);
                })
        }
        if (loginInfo && loginInfo._id) {
            console.log('anibisLocalFavorites', localStorage.getItem('anibisLocalFavorites'))
            if (localStorage.getItem('anibisLocalFavorites')) {
                localStorage.removeItem('anibisLocalFavorites');
                Axios.post(USER_FAVORITE_LOCAL_SYNC_API, { favoriteIds })
                    .then(response => {
                        console.log('/USER_FAVORITE_LOCAL_SYNC_API response.data', response.data)
                        fetchRemoteFavoriteIds();
                    }).catch(err => {
                        alert(err);
                    })
            } else {
                fetchRemoteFavoriteIds();
            }
        }
    }, [loginInfo]);

    console.log('loginInfo', loginInfo)
    console.log('favoriteIds', favoriteIds)
    useEffect(function () {
        localStorage.setItem('language', language);
    }, [language]);

    // useEffect(() => {
    //     console.log('useEffect pageYOffset set', window.pageYOffset)
    //     if (modalOpenPrepare) {
    //         setPageYOffset(window.pageYOffset);
    //         setDisableScrollY(true);
    //     }
    // }, [modalOpenPrepare]);

    useEffect(() => {
        if (!disableScrollY && pageYOffset !== null) {
            window.scrollTo(0, pageYOffset);
            console.log('useEffect pageYOffset', pageYOffset)
            setPageYOffset(null);
        }
    }, [disableScrollY, pageYOffset])
    // useEffect(function () {
    //     Axios.post("/textPack", {lng: 'de', id: 0})
    //         .then(response => {
    //             // console.log('/textPack response.data', response.data)
    //         }).catch(err => {
    //             alert(err);
    //         })
    // }, [])
    // useEffect(() => {
    //     console.log('Root useEffect 2');
    //     if (!countryListRef.current) {
    //         countryListRef.current = { de: null, fr: null, it: null };
    //         console.log('init countryListRef.current');
    //     }
    // }, []);
    console.log('Root loginInfo', loginInfo);
    console.log('toogleMenuOpen', menuOpen)
    setAuthorizationToken(loginInfo ? loginInfo.token : "");

    let contextValue: IRootContext = {
        favoriteIds: favoriteIds, 
        setFavoriteIds: setFavoriteIds,
        loginInfo: loginInfo, 
        setLoginInfo: setLoginInfo,
        language: language, 
        setLanguage: setLanguage,
        commonTexts: textPack,
        dummyCategory: { id: 0, name: trans("apps.inallcategories", textPack) },
        isMobileSCreenSize: width < 1024,
        usedDisableScrollY: [disableScrollY, setDisableScrollY],
        usedPageYOffset: [pageYOffset, setPageYOffset],
        searchResultIdsRef: searchResultIdsRef,
        detailPreviousPathRef: detailPreviousPathRef,
        countryListRef: countryListRef,
        categoryAttributesCacheRef: categoryAttributesCacheRef,
        subCategoryCacheRef: subCategoryCacheRef,
    }

    const t = useCallback(function (key) {
        return textPack && textPack.has(key) ? textPack.get(key) : key;
    }, [textPack]);

    const notifyLoginRedirect = useCallback((clickData) => {
        const redirect = AUTHORIZED_MENUS.includes(clickData) && !loginInfo;
        if (redirect)
            history.push("/login");
        return !redirect;
    }, [history, loginInfo]);

    const onAuthorizedMenuClick = useCallback((e) => {
        if (menuOpen)
            setMenuOpen(false);
        e.preventDefault();
        const clickData = e.target.getAttribute('data-click');
        console.log('data-click', clickData, notifyLoginRedirect(clickData))
        if (notifyLoginRedirect(clickData)) {
            switch (clickData) {
                case "user":
                    history.push("/user");
                    break;
                case "myadverts":
                    history.push(loginInfo.role !== "admin" ? "/myadverts" : "/myadverts-admin");
                    break;
                case "favorites":
                    history.push("/favorites");
                    break;
                case "newInsert":
                    editAdvertRef.current = null;
                    history.push("/insert");
                    break;
                default:
                    break;
            }
        }
    }, [menuOpen, notifyLoginRedirect, history, loginInfo && loginInfo.role]);

    return <RootContext.Provider value={contextValue}>
        <div id="root-container" className={disableScrollY ? "disable-scroll-y" : ""} style={disableScrollY ? { marginTop: -pageYOffset, height: height + pageYOffset } : {}}>
            <nav id="nav" className={"main-menu blurable" + (searchMenuSelected ? " home" : "")}>
                <ul id="nav-left">
                    <li><Link to="/" className="link-logo" ><img src={anibisLogo} alt="" /></Link></li>

                    <li><Link to="/" className={"link-icon search res-ib minw768" + (searchMenuSelected ? " selected" : "")}>{t("apps.action.nav.search")}</Link></li>

                    <li className="dropdown">
                        <Link to={loginInfo ? "/user" : "/login"} className="link-icon login dropbtn res-ib minw768">{loginInfo ? loginInfo.email : t("apps.action.nav.login")}</Link>
                        <div className={"dropdown-content" + (loginInfo ? " droppable" : "")}>
                            <Link to="" className="simple-link" data-click="user" onClick={onAuthorizedMenuClick}>{t("apps.action.nav.account")}</Link>
                            <Link to="" className="simple-link" data-click="myadverts" onClick={onAuthorizedMenuClick}>{t("apps.action.nav.listings")}</Link>
                        </div>
                    </li>
                </ul>

                <ul id="nav-right">
                    <li className=""><Link to={loginInfo ? "/message" : "/login"} className="link-icon message phone-responsive"></Link></li>

                    <li className="res-ib minw600">
                        <select id="langs" value={language} onChange={onlanguagechange}>
                            <option value="en">en</option>
                            <option value="de">de</option>
                            <option value="fr">fr</option>
                            <option value="it">it</option>
                        </select>
                    </li>

                    {favoriteIds.length > 0 &&
                        <li className="res-ib minw768"><Link to="" data-click="favorites" onClick={onAuthorizedMenuClick} className={"link-icon favorite" + (favoriteMenuSelected ? " selected" : "")}>
                            <span className="menu-count">{favoriteIds.length}</span></Link></li>}

                    <li className="res-ib minw480"><Link to="" data-click="newInsert" onClick={onAuthorizedMenuClick} className="link-button material small green insert">
                        {t("apps.action.nav.insert")}</Link></li>

                    <li className="res-ib maxw767"><button className="simple-link link-icon hamburger" onClick={openMenu}></button></li>
                </ul>
            </nav>

            <div id="alex" />

            <div id="phone-insert-button-container">
                <Link to="" data-click="newInsert" onClick={onAuthorizedMenuClick} className="link-button material small green insert block">{t("apps.action.nav.insert")}</Link>
            </div>

            <MenuModal isOpen={menuOpen} onXClick={closeMenu} onAuthorizedMenuClick={onAuthorizedMenuClick} />

            <Suspense fallback={<div>Loading...</div>}>

                <Switch>
                    <Route exact path="/"
                        render={(props) => (
                            <Home {...props}  lng={LNG}/>
                        )}>
                    </Route>

                    <Route exact path="/login"
                        render={(props) => (
                            <Login {...props} setEmailStatus={setEmailStatus}/>
                        )}>
                    </Route>

                    <Route exact path="/register"
                        render={(props) => (
                            <Register {...props} emailStatus={emailStatus} setEmailStatus={setEmailStatus} setLoginInfo={setLoginInfo}/>
                        )}>
                    </Route>

                    <Route exact path="/user"
                        render={(props) => (
                            <User {...props} loginInfo={loginInfo} setLoginInfo={setLoginInfo}/>
                        )}>
                    </Route>

                    <Route exact path="/insert"
                        render={(props) => (
                            <Insert {...props} loginInfo={loginInfo} lng={LNG} editAdvert={editAdvertRef.current}/>
                        )}>
                    </Route>

                    <Route exact path="/myadverts"
                        render={(props) => (
                            <MyAdverts {...props} loginInfo={loginInfo} lng={LNG} filterApi={ADVERT_MY_ADVERT_IDS_API} editAdvertRef={editAdvertRef}/>
                        )}>
                    </Route>

                    <Route exact path="/search"
                        render={(props) => (
                            <SearchResults {...props} loginInfo={loginInfo} lng={LNG}  key="SearchResults"/>
                        )}>
                    </Route>

                    <Route exact path="/myadverts-admin"
                        render={(props) => (
                            <MyAdverts {...props} loginInfo={loginInfo} lng={LNG}
                                 filterApi={ADVERT_MY_ADVERT_IDS_FOR_ADMIN_API}/>
                        )}>
                    </Route>

                    <Route exact path="/detail/:id"
                        render={(props) => (
                            <DetailBrowser {...props} lng={LNG}/>
                        )}>
                    </Route>

                    <Route exact path="/favorites"
                        render={(props) => (
                            <Favorites {...props} loginInfo={loginInfo} lng={LNG}/>
                        )}>
                    </Route>

                </Switch>
            </Suspense>

            <div id="main-footer" className="form-footer with-nav consistent-padding">
                <FormFooter />
            </div>

        </div>
    </RootContext.Provider>;
}

export default Root; 