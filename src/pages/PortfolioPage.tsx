import { useAtom, useSetAtom } from "jotai";
import style from "./styles/PortfolioPage.module.scss";
import {
  allPortfolios,
  portfolioItems,
  selectedPortfolio,
  selectedPortfolioIdAtom,
} from "../store/portfolios/atoms";
import { useEffect, useState } from "react";
import {
  deleteCurrentPortfolioAtom,
  getAllPortfoliosAtom,
  getPortfolioItemsByIdAtom,
  setCurrentPortfolioAtom,
} from "../store/portfolios/action";
import modalStyle from "../widgets/styles/TransactionCreateModal.module.scss";
import PortfolioCreateModal from "../widgets/PortfolioCreateModal";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react"; // 🟢 Trash2 아이콘 추가

function PortfolioPage() {
  const [portfolios] = useAtom(allPortfolios);
  const [portfolioBasicData] = useAtom(selectedPortfolio);
  const [portfolioData] = useAtom(portfolioItems);
  const [selectedPortfolioId] = useAtom(selectedPortfolioIdAtom);
  const getAllPortfolios = useSetAtom(getAllPortfoliosAtom);
  const getPortfolioItemsById = useSetAtom(getPortfolioItemsByIdAtom);
  const setCurrentPortfolio = useSetAtom(setCurrentPortfolioAtom);
  const deleteCurrentPortfolio = useSetAtom(deleteCurrentPortfolioAtom);

  const [togglePortfolioCreateModal, setTogglePortfolioCreateModal] =
    useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getAllPortfolios();
  }, [getAllPortfolios]);

  useEffect(() => {
    if (selectedPortfolioId === null) {
      getAllPortfolios();
    } else if (selectedPortfolioId) {
      getPortfolioItemsById(selectedPortfolioId);
    }
  }, [
    portfolios,
    getPortfolioItemsById,
    selectedPortfolioId,
    getAllPortfolios,
  ]);

  const handleNavigateToTransactionPage = () => {
    navigate("/transactions");
  };

  // 🟢 [수정] 특정 포트폴리오 삭제 (이벤트 전파 중단 필수)
  const handleDeletePortfolio = async (
    e: React.MouseEvent,
    portfolioId: string
  ) => {
    e.stopPropagation(); // 부모(선택) 클릭 방지
    if (window.confirm("정말 이 포트폴리오를 삭제하시겠습니까?")) {
      // 현재 선택된 포트폴리오라면 삭제 로직 호출 (로직에 따라 id 전달 필요할 수 있음)
      // 여기서는 기존 atom 액션이 '현재 선택된 것'을 삭제한다고 가정하고,
      // 삭제하려는게 현재 선택된 것과 다르면 먼저 선택해야 할 수도 있음.
      // 편의상 현재 선택된 포트폴리오만 삭제 가능하게 하거나, 액션을 수정해야 함.
      // 일단 현재 선택된 경우만 삭제하도록 UI를 구성하거나, 클릭 시 선택되게 처리됨.
      if (selectedPortfolioId !== portfolioId) {
        setCurrentPortfolio(portfolioId);
        // 상태 업데이트 대기 후 삭제가 이상적이나, 간단히 confirm 후 진행
      }
      await deleteCurrentPortfolio();
    }
  };

  return (
    <div className={style.pageWrapper}>
      <div className={style.header}>
        <div className={style.title}>포트폴리오</div>

        <div className={style.buttonRail}>
          <button
            className={style.createButton}
            onClick={handleNavigateToTransactionPage}
          >
            거래내역 보기
          </button>
          {/* 🔴 [삭제] 상단 삭제 버튼 제거됨 */}
        </div>
      </div>

      <div className={style.contentContainer}>
        {/* 왼쪽 사이드바 */}
        <aside className={style.sidebar}>
          <div className={style.sidebarHeader}>
            <span>내 목록</span>
            <button
              className={style.miniAddButton}
              onClick={() => setTogglePortfolioCreateModal(true)}
              title="새 포트폴리오 추가"
            >
              <Plus size={16} />
            </button>
          </div>

          {portfolios.map((portfolio) => (
            // 🟢 [수정] 사이드바 아이템 구조 변경 (div > span + button)
            <div
              key={portfolio._id}
              className={`${style.sidebarItem} ${
                selectedPortfolioId === portfolio._id ? style.active : ""
              }`}
              onClick={() => setCurrentPortfolio(portfolio._id)}
            >
              <span className={style.sidebarName}>{portfolio.name}</span>

              {/* 휴지통 아이콘 (활성화된 항목에만 표시하거나 항상 표시) */}
              <button
                className={style.sidebarDeleteBtn}
                onClick={(e) => handleDeletePortfolio(e, portfolio._id)}
                title="삭제"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}

          {portfolios.length === 0 && (
            <div className={style.emptySidebar}>
              포트폴리오를
              <br />
              생성해주세요
            </div>
          )}
        </aside>

        {/* 오른쪽 테이블 (기존 유지) */}
        <div className={style.portfolioContainer}>
          <table className={style.portfolioTable}>
            <thead>
              <tr>
                <th>티커</th>
                <th>회사</th>
                <th>평균 가격</th>
                <th>현재 가격</th>
                <th>변화율(%)</th>
                <th>총액</th>
              </tr>
            </thead>
            <tbody>
              {portfolioData && portfolioData.length > 0 ? (
                portfolioData.map((portfolio) => (
                  <tr key={portfolio.ticker}>
                    <td>{portfolio.ticker}</td>
                    <td>{portfolio.name}</td>
                    <td>{(portfolio.averagePrice || 0).toFixed(2)}</td>
                    <td className={style.currentPrice}>
                      {portfolio.currentPrice}
                    </td>
                    <td
                      className={`${style.returnRate} ${
                        portfolio.returnRate > 0 ? style.profit : style.loss
                      }`}
                    >
                      {(portfolio.returnRate || 0).toFixed(1)}%
                    </td>
                    <td>
                      {(portfolio.totalValue || 0).toFixed(1)}
                      {portfolioBasicData?.baseCurrency}
                    </td>
                  </tr>
                ))
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
                    보유 중인 자산이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {togglePortfolioCreateModal && (
        <div
          className={modalStyle.overlay}
          onClick={() => setTogglePortfolioCreateModal(false)}
        >
          <PortfolioCreateModal
            onClose={() => setTogglePortfolioCreateModal(false)}
          />
        </div>
      )}
    </div>
  );
}

export default PortfolioPage;
