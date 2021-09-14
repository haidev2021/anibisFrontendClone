import { Link } from 'react-router-dom'
import React, { useCallback, useContext } from 'react';
import { useHistory} from "react-router-dom";
import { trans } from '../../utils/common';
import { RootContext } from '../../root';
import './style.css';
import { NullableIRootContext, IXBaseCategory } from '../../utils/xbaseInterface.d';
export interface ISearchNavigator {
    categoryPath: {id: number, name: string}[];
    advertTitle?: string;
    id: string;
}
export function SearchNavigator(props: ISearchNavigator) {
    const { categoryPath, advertTitle, id } = props;
    const rootContext = useContext(RootContext) as NullableIRootContext;
    const history = useHistory();

    const onCategoryClick = useCallback((e)=> {
        e.preventDefault();
        const id = e.target.getAttribute('data-click');
        history.push({ pathname: "/search", search: '?cid=' + id });
    }, [history]);

    const sepClass = "backgrounded-span search-navigator-separator-icon after";
    const linkClass = "simple-link secondary no-hover-color";
    const listItemClass = "search-navigator-item";


    return <ul className="search-navigator res-f minw768" id={id}>
        {rootContext && <li className={listItemClass}>
            <Link className={linkClass} to="/">
                <span className={!categoryPath || categoryPath.length === 0 ? "" : sepClass}>
                    {trans("apps.homepage", rootContext.commonTexts)}
                </span>
            </Link>
        </li>}
        {categoryPath && categoryPath.map((cat, index) => {
            return <li className={listItemClass}>
                <Link to="" className={linkClass} onClick={onCategoryClick} data-click={cat.id}>
                    <span  data-click={cat.id} className={index === categoryPath.length - 1 && !advertTitle ? "" : sepClass}>
                        {cat.name}
                    </span>
                </Link>
            </li>
        })}
        {advertTitle && <li id="advert-title">
            {advertTitle}
        </li>}
    </ul>
}