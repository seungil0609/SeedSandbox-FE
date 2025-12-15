import { useEffect, useMemo, useState } from "react";
import style from "./styles/SearchBar.module.scss";
import { Search } from "lucide-react";
import { useAtom, useSetAtom } from "jotai";
import { AssetSearchResultAtom } from "../store/search/atoms";
import {
  getAssetSearchData,
  getSelectedAssetDetailDataAtom,
} from "../store/search/action";
import { useNavigate } from "react-router-dom";
import AssetDetailModal from "./AssetDetailModal";

function SearchBar() {
  const [results] = useAtom(AssetSearchResultAtom);
  const fetchSearch = useSetAtom(getAssetSearchData);
  const getDetailData = useSetAtom(getSelectedAssetDetailDataAtom);
  const [query, setQuery] = useState("");
  const [dropodownOpen, setDropdownOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const navigate = useNavigate();

  // debounce
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      return;
    }
    const t = setTimeout(() => {
      fetchSearch(q);
      setDropdownOpen(true);
    }, 250);
    return () => clearTimeout(t);
  }, [query, fetchSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/search/${q}`);
  };

  const handleSelect = async (ticker: string) => {
    await getDetailData(ticker);
    setDropdownOpen(false);
    setIsDetailOpen(true);
  };

  const handleDetailClose = () => {
    setIsDetailOpen(false);
  };

  const hasResults = useMemo(() => (results?.length ?? 0) > 0, [results]);

  return (
    <>
      <form className={style.searchBar} onSubmit={handleSubmit}>
        <input
          className={style.searchBar__input}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setDropdownOpen(true)}
          onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
          placeholder="Samsung, AAPL"
        />
        <button className={style.searchBar__button} type="submit">
          <Search />
        </button>

        {dropodownOpen && hasResults && results && (
          <div className={style.dropdown}>
            {results.map((item) => (
              <button
                key={item.symbol}
                type="button"
                className={style.dropdown__item}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(item.symbol)}
                aria-label={`${item.shortname} 선택`}
              >
                <span className={style.dropdown__symbol}>{item.symbol}</span>
                <span className={style.dropdown__name}>{item.shortname}</span>
                <span className={style.dropdown__meta}>
                  {item.exchange} · {item.typeDisp}
                </span>
              </button>
            ))}
          </div>
        )}
      </form>
      {isDetailOpen && <AssetDetailModal onClose={handleDetailClose} />}
    </>
  );
}

export default SearchBar;
