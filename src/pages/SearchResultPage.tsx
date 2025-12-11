import { useParams } from 'react-router-dom';
import style from './styles/SearchResultPage.module.scss';
import { AssetSearchResultAtom, SearchKeywordAtom } from '../store/search/atoms';
import { useAtom, useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { getAssetSearchData, getSelectedAssetDetailDataAtom } from '../store/search/action';
import AssetDetailModal from '../widgets/AssetDetailModal';

function SearchResultPage() {
    const [searchKeyword] = useAtom(SearchKeywordAtom);
    const [searchResult] = useAtom(AssetSearchResultAtom);
    const getSearchResult = useSetAtom(getAssetSearchData);
    const getDetailData = useSetAtom(getSelectedAssetDetailDataAtom);
    const param = useParams();
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    useEffect(() => {
        if (!searchKeyword) {
            getSearchResult(param.query ?? '');
        }
    }, []);

    const handleDetailOpen = async (ticker: string) => {
        await getDetailData(ticker);
        setIsDetailOpen(true);
    };
    const handleDetailClose = () => {
        setIsDetailOpen(false);
    };

    return (
        <div className={style.pageWrapper}>
            <div className={style.header}>
                <div className={style.title}>검색결과</div>
            </div>
            <div className={style.cardList}>
                {searchResult &&
                    searchResult.map((result) => (
                        <button
                            key={result.symbol}
                            className={style.card}
                            onClick={() => handleDetailOpen(result.symbol)}>
                            <div className={style.cardHeader}>
                                <span className={style.cardBoardType}>{result.symbol}</span>
                                <span className={style.cardDate}>{result.exchange}</span>
                            </div>
                            <div className={style.cardTitle}>{result.shortname}</div>
                        </button>
                    ))}
            </div>
            {isDetailOpen && <AssetDetailModal onClose={handleDetailClose} />}
        </div>
    );
}

export default SearchResultPage;
