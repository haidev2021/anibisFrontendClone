
import React, { Component, Fragment, useState, useEffect, useLayoutEffect, useRef, useCallback, useContext } from 'react';
import "./uidemo.css";

export default function UIDemo(props: any): JSX.Element {
    return <div className="uidemo">
        (holder)-(item1)-(item2)-(sync-hover)
        <br />
        {/* <img src={require('./uisample/link-text-icon-sync.png')} height={30}></img> */}
        -link-text-icon-sync:
            <a href="" className="after0"><span className="BACKGROUNDED-SPAN-AFTER iconned-text">urslh</span></a> +
            <a href="" className="after1"><span className="BACKGROUNDED-SPAN-AFTER iconned-text">urslh</span></a> +
            <a href="" className="after2"><span className="BACKGROUNDED-SPAN-AFTER iconned-text">height:25</span></a> +
            <a href="" className="after3"><span className="BACKGROUNDED-SPAN-AFTER iconned-text">height:25</span></a> +
        {/* </div> */}
        <br />
        <hr />
        -link-icon-text-sync:
        {/* <div className="a-grid"> */}
        <a href="" className="before0"><span className="BACKGROUNDED-SPAN-BEFORE iconned-text">urslh</span></a> +
            <a href="" className="before1"><span className="BACKGROUNDED-SPAN-BEFORE iconned-text">urslh</span></a> +
            <a href="" className="before2"><span className="BACKGROUNDED-SPAN-BEFORE iconned-text">height:25</span></a> +
            <a href="" className="before3"><span className="BACKGROUNDED-SPAN-BEFORE iconned-text">height:25</span></a> +
        <br />
        <hr />
        {/* </div> */}
        -small_button-text-icon-sync: (BUG: sync full button hover)
            <button className="after0"><span className="BACKGROUNDED-SPAN-AFTER iconned-text">urslh</span></button> +
            <button className="after1"><span className="BACKGROUNDED-SPAN-AFTER iconned-text">urslh</span></button> +
            <button className="after2"><span className="BACKGROUNDED-SPAN-AFTER iconned-text">height:25</span></button> +
            <button className="after3"><span className="BACKGROUNDED-SPAN-AFTER iconned-text">height:25</span></button> +
        <br />
        <hr />
        -small_button-icon-text-sync: (BUG: sync full button hover)
            <button className="before0"><span className="BACKGROUNDED-SPAN-BEFORE iconned-text">urslh</span></button> +
            <button className="before1"><span className="BACKGROUNDED-SPAN-BEFORE iconned-text">urslh</span></button> +
            <button className="before2"><span className="BACKGROUNDED-SPAN-BEFORE iconned-text">height:25</span></button> +
            <button className="before3"><span className="BACKGROUNDED-SPAN-BEFORE iconned-text">height:25</span></button> +
        <br />
        <hr />
        -big_button-text-icon-sync
            <button className="after0 big-button"><span className="BACKGROUNDED-SPAN-AFTER iconned-text">urslh</span></button> +
            <button className="after1 big-button"><span className="BACKGROUNDED-SPAN-AFTER iconned-text">urslh</span></button> +
            <button className="after2 big-button reset-origin-button"><span className="BACKGROUNDED-SPAN-AFTER iconned-text">height:25</span></button> +
            <button className="after3 big-button reset-origin-button"><span className="BACKGROUNDED-SPAN-AFTER iconned-text">height:25</span></button> +
            <button className="after4 big-button"><span className="BACKGROUNDED-SPAN-AFTER iconned-text">long long long long long long long long long long long </span></button> +
        <br />
        <hr />
        -big_button-icon-text-sync
            <button className="before0 big-button"><span className="BACKGROUNDED-SPAN-BEFORE iconned-text">urslh</span></button> +
            <button className="before1 big-button"><span className="BACKGROUNDED-SPAN-BEFORE iconned-text">urslh</span></button> +
            <button className="before2 big-button reset-origin-button"><span className="BACKGROUNDED-SPAN-BEFORE iconned-text">height:25</span></button> +
            <button className="before3 big-button reset-origin-button"><span className="BACKGROUNDED-SPAN-BEFORE iconned-text">height:25</span></button> +
        <br />
        <hr />
        -div-text-icon-sync
            <div className="after0 div"><span className="BACKGROUNDED-SPAN-AFTER iconned-text">urslh</span></div> +
            <div className="after1 div"><span className="BACKGROUNDED-SPAN-AFTER iconned-text">urslh</span></div> +
            <div className="after2 div reset-origin-div"><span className="BACKGROUNDED-SPAN-AFTER iconned-text">height:25</span></div> +
            <div className="after3 div reset-origin-div"><span className="BACKGROUNDED-SPAN-AFTER iconned-text">height:25</span></div> +
        <br />
        <hr />
        -div-icon-text-sync
            <div className="before0 div"><span className="BACKGROUNDED-SPAN-BEFORE iconned-text">urslh</span></div> +
            <div className="before1 div"><span className="BACKGROUNDED-SPAN-BEFORE iconned-text">urslh</span></div> +
            <div className="before2 div reset-origin-div"><span className="BACKGROUNDED-SPAN-BEFORE iconned-text">height:25</span></div> +
            <div className="before3 div reset-origin-div"><span className="BACKGROUNDED-SPAN-BEFORE iconned-text">height:25</span></div> +
        <br />
        <hr />
        -div-text-icon-async
            <div className="div-async reset-origin-div"><span className="plain-text-before">urslh</span><span className="backgrounded-span-self iconned-text-self"></span></div> +
            <div className="div-async reset-origin-div"><span className="plain-text-before">long text long text long text</span><span className="backgrounded-span-self iconned-text-self"></span></div> +
        <br />
        <hr />
        -div-icon-text-async
            <div className="div-async reset-origin-div"><span className="backgrounded-span-self iconned-text-self"></span><span className="plain-text-after">urslh</span></div> +
            <div className="div-async reset-origin-div"><span className="backgrounded-span-self iconned-text-self"></span><span className="plain-text-after">long text long text long text</span></div> +

        <br />
        <hr />
        -div-text
        <div className="div-text h-60-flex">height: 60px; flex, align-items, justify-content, padding</div> + 
        <div className="div-text h-60-grid">(BUG) height: 60px; grid</div> + 
        <div className="div-text h-60-block">(BUG) height: 60px; block, text-align, line-height</div> + 
        <div className="div-text h-unset">height: unset; display: flex, padding, padding, padding, padding</div> + 
        <br />
        <hr />
        -div-span
        <div className="div-span h-60-flex"><span>height: 60px; flex, align-items, justify-content, padding</span></div> + 
        <div className="div-span h-60-grid"><span>(BUG) height: 60px; grid</span></div> + 
        <div className="div-span h-60-block"><span>(BUG) height: 60px; block, text-align, line-height</span></div> + 
        <div className="div-span h-unset"><span>height: unset; display: flex, padding, padding, padding, padding</span></div> + 
        <br />
        <hr />
        -flexed-link-text-icon-sync: failed (flex never goes with sync)
            <a href="" className="flexed-after0"><span className="FLEXED-BACKGROUNDED-SPAN-AFTER flexed-iconned-text">urslh (FAILED)</span></a>
        <br />
        <hr />
        -div-text-link-async
        <br />
        <hr />
        -button-text/text-sync
        <br />
        <hr />
        (text)-(separator)-(text)-(separator)-(text)-(separator)....
        <br />
    </div>
}