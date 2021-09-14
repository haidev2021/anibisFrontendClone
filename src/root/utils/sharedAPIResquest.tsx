
import Axios from 'axios';
import { USER_FAVORITE_ADD_REMOVE_API } from './network';
import { NullableIRootContext } from './xbaseInterface.d';

export enum EFavoriteAction {
    FAVORITE_STATUS = 0,
    FAVORITE_ADD = 1,
    FAVORITE_DELETE = -1,
}

export function addRemoveFavorite(isFavorite: boolean, advertId: string, rootContext: NullableIRootContext, callback: () => void ) {
    console.log('addRemoveFavorite isFavorite', isFavorite, advertId, rootContext)
    const loginInfo = rootContext && rootContext.loginInfo;
    let action = isFavorite ? EFavoriteAction.FAVORITE_DELETE : EFavoriteAction.FAVORITE_ADD;
    function updateRootFavoritesId(action: number) {
        if (rootContext) {
            if (action === EFavoriteAction.FAVORITE_ADD) {
                const newRootFavIds = [advertId, ...rootContext.favoriteIds];
                rootContext.setFavoriteIds(newRootFavIds);
                if (!loginInfo || !loginInfo._id) {
                    localStorage.setItem('anibisLocalFavorites', JSON.stringify(newRootFavIds));
                }
            } else if (action === EFavoriteAction.FAVORITE_DELETE) {
                let deleteId, remains;
                deleteId = advertId;
                [deleteId, ...remains] = rootContext.favoriteIds;
                rootContext.setFavoriteIds(remains);
                if (!loginInfo || !loginInfo._id) {
                    localStorage.setItem('anibisLocalFavorites', JSON.stringify(remains));
                }
            }
        }
    }

    updateRootFavoritesId(action);

    if (loginInfo && loginInfo._id) {
        Axios.post(USER_FAVORITE_ADD_REMOVE_API, { id: advertId, action: action })
            .then(response => {
                let code = response.data.statusCode;
                if (code === 404) {
                    alert("advert doesnt exist");
                    updateRootFavoritesId(action * (-1));
                } else if (callback) {
                    callback();
                }
            })
            .catch(err => {
                alert("onFavoriteClick ERROR: " + err);
                updateRootFavoritesId(action * (-1));
            });
    }
}