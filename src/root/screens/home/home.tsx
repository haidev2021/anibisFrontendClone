import { Route, Switch, NavLink, Link } from 'react-router-dom'
import React, { Component, useState, useEffect, useLayoutEffect, useRef, useCallback, Fragment, useContext } from 'react';
import Axios from 'axios';
import { useHistory } from "react-router-dom";
import "./style.css";
import { HorizontalList, AdvertItem, GridList } from '../../components/advertLists/list';
import { RootContext } from '../../root';
import { trans, useTextPack } from '../../utils/common';
import { CATEGORY_ID, SEARCH_TERM } from '../../utils/searchQueryHelper';
import { TextSearch } from '../../components/textSearch/textSearch';
import { ADVERT_GALLERY_API, ADVERT_LASTEST_OFFERS_API, ADVERT_SEARCH_RESULT_API } from '../../utils/network';
import HomeCategorySelector from '../../containers/home/homeCategorySelector';
import { IXBaseCategory, IRootContext, TLanguage, TTextPackId } from '../../utils/xbaseInterface.d';

const SHORTCUT_CATS = [
    { id: 0, icon: "all-cat", text: "apps.home.new.inallcategories" },
    { id: 410, icon: "immo-cat", text: "apps.home.new.realestate.rent" },
    { id: 438, icon: "immo-cat", text: "apps.home.new.realestate.buy" },
    { id: 113, icon: "car-cat", text: "apps.home.new.cars" },
    { id: 305, icon: "job-cat", text: "apps.home.new.jobs" },
    { id: 15, icon: "erotic-cat", text: "Erotik" },]

export interface IHome {
    lng: TLanguage;
}
export default function Home(props: IHome): JSX.Element {
    const { lng } = props;
    const rootContext: IRootContext = useContext(RootContext);
    const history = useHistory();
    const [searchTerm, setSearchTerm] = useState("");
    const [galleryAdvertIds, setGalleryAdvertIds] = useState([]);
    const [latestOffers, setLatestOffers] = useState([]);
    const [titleCount, setTitltCount] = useState<number | string>("...");
    const [categoryOpen, setCategoryOpen] = useState<boolean>(false);
    const textPack = useTextPack(rootContext, "HOME" as TTextPackId);

    useEffect(() => {
        Axios.post(ADVERT_LASTEST_OFFERS_API, {
            lng: lng
        })
            .then(function (response) {
                console.log("POST '/lastestOffers' RESPONSE = ", response.data);
                setLatestOffers(response.data);
            })
            .catch(function (error) {
                console.log("POST '/lastestOffers' ERROR:", error);
                alert("POST '/lastestOffers' ERROR:" + error);
            });
        Axios.post(ADVERT_GALLERY_API, {
            lng: lng
        })
            .then(function (response) {
                console.log("POST '/gallery' RESPONSE = ", response.data);
                setGalleryAdvertIds(response.data);
            })
            .catch(function (error) {
                console.log("POST '/gallery' ERROR:", error);
                alert("POST '/gallery' ERROR:" + error);
            });
    }, [lng]);

    const onTermChange = useCallback(function (e) {
        setSearchTerm(e.target.value);
    }, []);

    const t = useCallback(function (key) {
        return textPack && textPack.has(key) ? textPack.get(key) : key;
    }, [textPack]);

    const onSearchTextClick = useCallback(function (e) {
        history.push(`/search?${SEARCH_TERM}=${searchTerm}`);
    }, [history, searchTerm]);

    const onAllCategoryClick = useCallback(function (e) {
        e.preventDefault();
        setCategoryOpen(true);
    }, []);

    const onShortcutCategoryClick = useCallback(function (e) {
        e.preventDefault();
        const clickData = e.target.getAttribute('data-click')
        history.push(`/search?${CATEGORY_ID}=${clickData}`);
    }, [history]);

    const onHomeCategorySelected = useCallback(function (cat: IXBaseCategory): void {
        history.push(`/search?${CATEGORY_ID}=${cat ? cat.id : 0}`);
    }, [history]);

    return <div className="home with-nav">
        <div className="blurable">
            <h1> {t("apps.home.new.title").replace('%d', titleCount)} </h1>
            <TextSearch value={searchTerm} onChange={onTermChange} onClick={onSearchTextClick} btnText={trans("apps.action.search", rootContext.commonTexts)}></TextSearch>
            <div className="shortcut-cats">
                <ul>
                    {SHORTCUT_CATS.map(item => {
                        return <li><Link to="" onClick={item.id ? onShortcutCategoryClick : onAllCategoryClick}>
                            <div data-click={item.id} className="shortcut-cat-item">
                                <span data-click={item.id} className={`${item.icon} link-icon`}></span>
                                <span data-click={item.id} className="category-text">{t(item.text)}</span>
                            </div>
                        </Link></li>
                    })}
                </ul>
            </div>

            <div className="gallery-container">
                <h3> {t("apps.home.gallery.label")} </h3>
                <HorizontalList advertIds={galleryAdvertIds} id="Gallery" itemClass="non-material-bordered" lng={lng} />
            </div>
            <div className="favorite-container" style={{ display: rootContext.favoriteIds.length > 0 ? 'block' : 'none' }}>
                <h3> {t("apps.home.favorites.label")} </h3>
                <HorizontalList advertIds={rootContext.favoriteIds} id="Favorites" itemClass="non-material-bordered" lng={lng} />
            </div>
            <div className="latest-offers-container">
                <h3> {t("apps.home.new.newoffers")}</h3>
                <GridList adverts={latestOffers} id="Last Offers" itemClass="non-material-bordered" />
            </div>
        </div>
        <HomeCategorySelector lng={lng} usedHomeModalOpenState={[categoryOpen, setCategoryOpen]}
            onHomeCategorySelected={onHomeCategorySelected} onRootSearchCountUpdate={setTitltCount} />
    </div>;
}