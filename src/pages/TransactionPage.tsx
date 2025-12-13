import { useAtom, useSetAtom } from "jotai";
import { AllTransactionAtom } from "../store/transaction/atom";
import style from "./styles/TransactionPage.module.scss";
import {
  deleteTransactionByIdAtom,
  getAllTransactionAtom,
} from "../store/transaction/action";
import { useEffect, useState, useMemo } from "react";
import { Trash, Plus } from "lucide-react";
import TransactionCreateModal from "../widgets/TransactionCreateModal";
import modalStyle from "../widgets/styles/TransactionCreateModal.module.scss";
import { useNavigate } from "react-router-dom";
import {
  allPortfolios,
  selectedPortfolioIdAtom,
} from "../store/portfolios/atoms";
import { setCurrentPortfolioAtom } from "../store/portfolios/action";

const EXCHANGE_RATE = 1450;

const formatMoney = (value: number, currency: string) => {
  const symbol =
    currency === "KRW"
      ? "₩"
      : currency === "USD"
      ? "$"
      : currency === "JPY"
      ? "¥"
      : currency === "EUR"
      ? "€"
      : "";

  const options =
    currency === "KRW"
      ? { maximumFractionDigits: 0 }
      : { minimumFractionDigits: 2, maximumFractionDigits: 2 };

  return `${symbol} ${value.toLocaleString(undefined, options)}`;
};

function TransactionPage() {
  const [transactionData] = useAtom(AllTransactionAtom);
  const [selectedPortfolioId] = useAtom(selectedPortfolioIdAtom);
  const [portfolios] = useAtom(allPortfolios);

  const getAllTransactionData = useSetAtom(getAllTransactionAtom);
  const setCurrentPortfolio = useSetAtom(setCurrentPortfolioAtom);
  const deleteTransactionById = useSetAtom(deleteTransactionByIdAtom);

  const [toggleTransactionCreateModal, setToggleTransactionCreateModal] =
    useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getAllTransactionData();
  }, [selectedPortfolioId, getAllTransactionData]);

  const handleNavigateToPortfolioPage = () => {
    navigate("/portfolio");
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (window.confirm("이 거래 내역을 삭제하시겠습니까?")) {
      await deleteTransactionById(transactionId);
    }
  };

  const handleAddTransaction = (e: React.MouseEvent, portfolioId: string) => {
    e.stopPropagation();
    setCurrentPortfolio(portfolioId);
    setToggleTransactionCreateModal(true);
  };

  const currentPortfolioObj = portfolios.find(
    (p) => p._id === selectedPortfolioId
  );
  const currentPortfolioName = currentPortfolioObj?.name || "";
  const baseCurrency = currentPortfolioObj?.baseCurrency || "USD";

  const sortedTransactions = useMemo(() => {
    if (!transactionData) return [];
    return [...transactionData].sort((a, b) => {
      return (
        new Date(b.transactionDate).getTime() -
        new Date(a.transactionDate).getTime()
      );
    });
  }, [transactionData]);

  return (
    <div className={style.pageWrapper}>
      <div className={style.header}>
        <div className={style.title}>거래내역</div>

        <div className={style.buttonRail}>
          <button
            className={style.createButton}
            onClick={handleNavigateToPortfolioPage}
          >
            포트폴리오 보기
          </button>
        </div>
      </div>

      <div className={style.contentContainer}>
        <aside className={style.sidebar}>
          <div className={style.sidebarHeader} style={{ color: "#fff" }}>
            포트폴리오
          </div>

          {portfolios.map((portfolio) => (
            <div
              key={portfolio._id}
              className={`${style.sidebarItem} ${
                selectedPortfolioId === portfolio._id ? style.active : ""
              }`}
              onClick={() => setCurrentPortfolio(portfolio._id)}
            >
              {/* 🟢 [수정] 이름 옆에 (통화) 추가 */}
              <span className={style.sidebarName}>
                {portfolio.name}
                <span
                  style={{
                    fontSize: "0.85em",
                    opacity: 0.6,
                    marginLeft: "4px",
                  }}
                >
                  ({portfolio.baseCurrency})
                </span>
              </span>

              <button
                className={style.sidebarIconBtn}
                onClick={(e) => handleAddTransaction(e, portfolio._id)}
                title="거래내역 추가"
              >
                <Plus size={16} />
              </button>
            </div>
          ))}
        </aside>

        <div className={style.mainContent}>
          <table className={style.portfolioTable}>
            <thead>
              <tr>
                <th>티커</th>
                <th>종류</th>
                <th style={{ textAlign: "right" }}>수량</th>
                <th style={{ textAlign: "right" }}>가격</th>
                <th>일자</th>
                <th>삭제</th>
              </tr>
            </thead>
            <tbody>
              {sortedTransactions.length > 0 ? (
                sortedTransactions.map((transaction) => {
                  const itemCurrency = transaction.currency;
                  let convertedPrice = null;

                  if (baseCurrency !== itemCurrency) {
                    if (baseCurrency === "KRW" && itemCurrency === "USD") {
                      convertedPrice = transaction.price * EXCHANGE_RATE;
                    } else if (
                      baseCurrency === "USD" &&
                      itemCurrency === "KRW"
                    ) {
                      convertedPrice = transaction.price / EXCHANGE_RATE;
                    }
                  }

                  return (
                    <tr key={transaction._id}>
                      <td style={{ fontWeight: "600", color: "#fff" }}>
                        {transaction.asset?.ticker}
                      </td>

                      <td
                        className={
                          transaction.transactionType === "BUY"
                            ? style.buy
                            : style.sell
                        }
                      >
                        {transaction.transactionType === "BUY"
                          ? "매수"
                          : "매도"}
                      </td>

                      <td style={{ textAlign: "right" }}>
                        {transaction.quantity.toLocaleString()}
                      </td>

                      <td
                        style={{ textAlign: "right" }}
                        className={style.price}
                      >
                        {formatMoney(transaction.price, transaction.currency)}

                        {convertedPrice !== null && (
                          <span
                            style={{
                              fontSize: "0.85em",
                              color: "rgba(255,255,255,0.5)",
                              marginLeft: "6px",
                              fontWeight: 400,
                            }}
                          >
                            ({formatMoney(convertedPrice, baseCurrency)})
                          </span>
                        )}
                      </td>

                      <td>
                        {transaction.transactionDate
                          .split("T")[0]
                          .replace(/-/g, ".")}
                      </td>

                      <td>
                        <button
                          className={style.actionButton}
                          onClick={() =>
                            handleDeleteTransaction(transaction._id)
                          }
                        >
                          <Trash />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: "center",
                      padding: "3rem",
                      color: "#666",
                    }}
                  >
                    거래 내역이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {toggleTransactionCreateModal && (
        <div
          className={modalStyle.overlay}
          onClick={() => setToggleTransactionCreateModal(false)}
        >
          <TransactionCreateModal
            onClose={() => setToggleTransactionCreateModal(false)}
          />
        </div>
      )}
    </div>
  );
}

export default TransactionPage;
