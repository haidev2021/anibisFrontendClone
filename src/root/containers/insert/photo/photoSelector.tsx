
import { Route, Switch, NavLink, Link } from 'react-router-dom'
import React, { Component, Fragment, useState, useEffect, useLayoutEffect, useRef, useCallback, useContext, useMemo } from 'react';
import Axios from 'axios';
import './style.css'
import { trans } from '../../../utils/common';
import { mockDetailPhotos } from '../helper/mockdata';
import { InsertionContext } from '../../../screens/insert/insert';
import { IXBaseAdvert } from '../../../utils/xbaseInterface.d';
const USE_MOCK_DATA = !true;

function getNewTimeMillis() {
    return Math.floor((new Date()).getTime()) % 1000000;
}

export interface IPhotoSelector {
    editAdvert: IXBaseAdvert;
}

export default function PhotoSelector(props: IPhotoSelector): JSX.Element {
    const {editAdvert} = props;
    const input = useRef(null);
    const insertionContext = useContext(InsertionContext);
    const photoUploadStateHandlers =
        [useState({ pos: getNewTimeMillis(), file: null, blogPhotosThumbnail: null, blogPhotosResized: null }),
        useState({ pos: getNewTimeMillis(), file: null, blogPhotosThumbnail: null, blogPhotosResized: null }),
        useState({ pos: getNewTimeMillis(), file: null, blogPhotosThumbnail: null, blogPhotosResized: null }),
        useState({ pos: getNewTimeMillis(), file: null, blogPhotosThumbnail: null, blogPhotosResized: null }),
        useState({ pos: getNewTimeMillis(), file: null, blogPhotosThumbnail: null, blogPhotosResized: null }),
        useState({ pos: getNewTimeMillis(), file: null, blogPhotosThumbnail: null, blogPhotosResized: null }),
        useState({ pos: getNewTimeMillis(), file: null, blogPhotosThumbnail: null, blogPhotosResized: null }),
        useState({ pos: getNewTimeMillis(), file: null, blogPhotosThumbnail: null, blogPhotosResized: null }),
        useState({ pos: getNewTimeMillis(), file: null, blogPhotosThumbnail: null, blogPhotosResized: null }),
        useState({ pos: getNewTimeMillis(), file: null, blogPhotosThumbnail: null, blogPhotosResized: null })];

    useEffect(() => {
        uploadPhoto(0);
    }, [photoUploadStateHandlers[0][0].file]);

    useEffect(() => {
        uploadPhoto(1);
    }, [photoUploadStateHandlers[1][0].file]);

    useEffect(() => {
        uploadPhoto(2);
    }, [photoUploadStateHandlers[2][0].file]);

    useEffect(() => {
        uploadPhoto(3);
    }, [photoUploadStateHandlers[3][0].file]);

    useEffect(() => {
        uploadPhoto(4);
    }, [photoUploadStateHandlers[4][0].file]);

    useEffect(() => {
        uploadPhoto(5);
    }, [photoUploadStateHandlers[5][0].file]);

    useEffect(() => {
        uploadPhoto(6);
    }, [photoUploadStateHandlers[6][0].file]);

    useEffect(() => {
        uploadPhoto(7);
    }, [photoUploadStateHandlers[7][0].file]);

    useEffect(() => {
        uploadPhoto(8);
    }, [photoUploadStateHandlers[8][0].file]);

    useEffect(() => {
        uploadPhoto(9);
    }, [photoUploadStateHandlers[9][0].file]);

    useEffect(() => {
        if (editAdvert != null) {
            let editPictures = editAdvert.pictures;
            if (editPictures) {
                editPictures.map((picture, index) => {
                    photoUploadStateHandlers[index][1](
                        { pos: getNewTimeMillis(), file: null, blogPhotosThumbnail: picture.blogPhotosThumbnail, blogPhotosResized: picture.blogPhotosResized }
                    );
                });
            }
        }
    }, [editAdvert]);

    // const getImageUrls = useCallback(() => {
    //     if (USE_MOCK_DATA && !editAdvert && mockDetailPhotos)
    //         return mockDetailPhotos;
    //     return Array.from(getSortedStateHandlers(), handler => ({
    //         blogPhotosThumbnail: handler[0].blogPhotosThumbnail,
    //         blogPhotosResized: handler[0].blogPhotosResized
    //     })).filter(imgSet => imgSet.blogPhotosResized != null);
    // },[getSortedStateHandlers, editAdvert])

    console.log('render', "PhotoSelector props = ", props);

    const getSortedStateHandlers = useCallback(function () {
        let result = Array.from(photoUploadStateHandlers);
        console.log('result.length', result.length)
        result.sort(function (a, b) {
            return a[0].pos - b[0].pos;
        })
        return result;
    }, [photoUploadStateHandlers]);

    insertionContext.getImageUrls = useMemo(() => function () {
        if (USE_MOCK_DATA && !editAdvert && mockDetailPhotos)
            return mockDetailPhotos;
        return Array.from(getSortedStateHandlers(), handler => ({
            blogPhotosThumbnail: handler[0].blogPhotosThumbnail,
            blogPhotosResized: handler[0].blogPhotosResized
        })).filter(imgSet => imgSet.blogPhotosResized != null);
    }, [getSortedStateHandlers, editAdvert])

    let sortedStateHandlers = getSortedStateHandlers();
    // let sortedStateHandlers = Array.from(photoUploadStateHandlers);
    // console.log('sortedStateHandlers.length', sortedStateHandlers.length)
    // sortedStateHandlers.sort(function (a, b) {
    //     return a[0].pos - b[0].pos;
    // })
    // sortedStateHandlers.map(handler => {
    //     console.log('pos', handler[0].pos)
    // });

    const uploadPhoto = useCallback(function (index) {
        let uploadHandler = photoUploadStateHandlers[index];
        if (uploadHandler[0].file != null) {
            console.log('uploadPhoto')
            const data = new FormData();
            data.append('selectedPhotoBinary', uploadHandler[0].file);
            Axios.post('/image/upload', data)
                .then(function (response) {
                    console.log('uploadPhoto response = ', response)
                    if (response.data.blogPhotosThumbnail) {
                        // alert(`photo added!`);
                        uploadHandler[1]((oldSlot) => {
                            return { ...oldSlot, blogPhotosThumbnail: response.data.blogPhotosThumbnail, blogPhotosResized: response.data.blogPhotosResized }
                        });
                    }
                    else
                        alert(JSON.stringify(response));
                })
                .catch(function (error) {
                    alert('/image/upload' + JSON.stringify(error));
                });
        }
    }, [photoUploadStateHandlers]);

    const onXClick = useCallback(function (e) {
        const pos = e.target.getAttribute('data-click')
        sortedStateHandlers[pos][1]({ pos: getNewTimeMillis(), file: null, blogPhotosThumbnail: null, blogPhotosResized: null });
        // inputs[i].current.value = ""; 
    }, [sortedStateHandlers]);

    const onPlusClick = useCallback(function (e) {
        e.preventDefault();
        input.current.click();
        // return false;
    }, []);
    
    //find n slot free from with smallest indexes

    const handleSelectedImages = useCallback(function (files) {
        console.log('handleSelectedImages files', files)
        let fisrtAvalableIndex = sortedStateHandlers.indexOf(sortedStateHandlers.filter(slot => (slot[0].file === null))[0]);
        console.log('fisrtAvalableIndex', fisrtAvalableIndex)
        if (fisrtAvalableIndex > -1)
            Array.from(files).map((file, i) => {
                if (fisrtAvalableIndex + i < 10)
                    sortedStateHandlers[fisrtAvalableIndex + i][1](oldSlot => ({ ...oldSlot, pos: getNewTimeMillis(), file: file }));
            })
    }, [sortedStateHandlers]);

    const onMultiSelectChange = useCallback(function (e) {
        handleSelectedImages(e.target.files);
    }, [handleSelectedImages]);

    const dropHandler = useCallback(function (e) {
        function isImage(fileName: string) {
            return (/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i).test(fileName);
        }
        let refinedFiles = [];
        console.log('File(s) dropped');

        // Prevent default behavior (Prevent file from being opened)
        e.preventDefault();

        if (e.dataTransfer.items) {
            // Use DataTransferItemList interface to access the file(s)
            for (var i = 0; i < e.dataTransfer.items.length; i++) {
                // If dropped items aren't files, reject them
                if (e.dataTransfer.items[i].kind === 'file') {
                    var file = e.dataTransfer.items[i].getAsFile();
                    console.log('dropHandler', '... file[' + i + '].name = ' + file.name);
                    if (isImage(file.name)) {
                        refinedFiles.push(file);
                    }
                }
            }
        } else {
            // Use DataTransfer interface to access the file(s)
            for (var i = 0; i < e.dataTransfer.files.length; i++) {
                var file = e.dataTransfer.files[i];
                console.log('dropHandler', '... file[' + i + '].name = ' + file.name);
                if (isImage(file.name)) {
                    refinedFiles.push(file);
                }
            }
        }
        handleSelectedImages(refinedFiles);
    }, [handleSelectedImages]);

    const dragOverHandler = useCallback(function (e) {
        console.log('dragOverHandler', 'File(s) in drop zone');
        // Prevent default behavior (Prevent file from being opened)
        e.preventDefault();
    }, []);

    let addedNum = sortedStateHandlers.filter(slot => (slot[0].file !== null)).length;
    let count = 0;
    return <div className="photos">
        <div id="drop_zone" onDrop={dropHandler} onDragOver={dragOverHandler}>
            <div className="uploaded">
                <ul>
                    {sortedStateHandlers.map((handle, i) => {
                        return (handle[0].file || handle[0].blogPhotosThumbnail) &&
                            <li key={i} className="material-bordered">
                                {handle[0].blogPhotosThumbnail &&
                                    <button className="link-button non-material" id="delete-image" data-click={i} onClick={onXClick}>{"\u2716"}</button>}
                                {handle[0].file && !handle[0].blogPhotosThumbnail && <span id="uploading-text"> {trans("apps.uploading", insertionContext.textPack)}...</span>}
                                {handle[0].blogPhotosThumbnail && <img src={"blogPhotosThumbnail/" + handle[0].blogPhotosThumbnail} alt=""></img>}
                                <label id="photo-name" htmlFor={"photo" + i}>{trans("apps.photo", insertionContext.textPack)} {++count} </label>
                            </li>
                    })}
                    {addedNum < 10 && <li key={'add-more'} id="add-more" className="material-bordered" onClick={onPlusClick}>
                        <span className="backgrounded-span add-image-icon before"></span>
                    </li>}
                </ul>
            </div>
            <div className="infos">
                <span className="photo-count">{trans("apps.totalphoto", insertionContext.textPack)} {addedNum} / 10</span>
                <div className="upload-icon"></div>
                <span className="photo-guide" style={{ display: addedNum < 10 ? 'block' : 'none' }}>{trans("apps.addphotohint", insertionContext.textPack)} ...</span>
            </div>
        </div>

        <input ref={input} multiple type="file" accept="image/*" onChange={onMultiSelectChange} style={{ display: "none" }} />

    </div>
}