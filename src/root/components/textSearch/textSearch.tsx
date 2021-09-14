
import React from 'react';

export interface ITextSearch {
    value: string;
    onChange: (params: any) => void;
    onClick: (params: any) => void;
    btnText: string;
}
export function TextSearch(props: ITextSearch) {
    const { value, onChange, onClick, btnText } = props;
    return <div id="text-search">
        <input id="text-search-input" className="large" value={value} onChange={onChange}></input>
        <button id="text-search-button" className="link-button non-material large blue" onClick={onClick}><span>{btnText}</span></button>
    </div>
}