import { useParams } from "react-router-dom";
import style from "./styles/SearchResultPage.module.scss";
import {
  AssetSearchResultAtom,
  SearchKeywordAtom,
} from "../store/search/atoms";
import { useAtom, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import {
  getAssetSearchData,
  getSelectedAssetDetailDataAtom,
} from "../store/search/action";
import AssetDetailModal from "../widgets/AssetDetailModal";

function SearchResultPage() {
  const [searchKeyword] = useAtom(SearchKeywordAtom);
  const [searchResult] = useAtom(AssetSearchResultAtom);
  const getSearchResult = useSetAtom(getAssetSearchData);
  const getDetailData = useSetAtom(getSelectedAssetDetailDataAtom);
  const param = useParams();
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    // 검색어가 없으면 URL 파라미터로 검색 수행
    if (!searchKeyword && param.query) {
      getSearchResult(param.query);
    }
  }, [param.query]); // 의존성 배열 수정

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

      <div className={style.resultList}>
        {searchResult && searchResult.length > 0 ? (
          searchResult.map((result) => (
            <button
              key={result.symbol}
              className={style.resultCard}
              onClick={() => handleDetailOpen(result.symbol)}
            >
              <div className={style.infoWrapper}>
                <div className={style.symbol}>{result.symbol}</div>
                <div className={style.name}>{result.shortname}</div>
              </div>

              <div className={style.exchangeBadge}>{result.exchange}</div>
            </button>
          ))
        ) : (
          <div className={style.emptyState}>검색 결과가 없습니다.</div>
        )}
      </div>

      {isDetailOpen && <AssetDetailModal onClose={handleDetailClose} />}
    </div>
  );
}

export default SearchResultPage;
