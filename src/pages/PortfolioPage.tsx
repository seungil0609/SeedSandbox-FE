import { useAtom, useSetAtom } from 'jotai';
import style from './styles/PortfolioPage.module.scss';
import { allPortfolios, portfolioItems, selectedPortfolio } from '../store/portfolios/atoms';
import { useEffect, useState } from 'react';
import {
    deleteCurrentPortfolioAtom,
    getAllPortfoliosAtom,
    getPortfolioItemsByIdAtom,
    setCurrentPortfolioAtom,
} from '../store/portfolios/action';
import modalStyle from '../widgets/styles/TransactionCreateModal.module.scss';
import { selectedPortfolioIdAtom } from '../store/portfolios/atoms';
import { ChevronDown } from 'lucide-react';
import PortfolioCreateModal from '../widgets/PortfolioCreateModal';
import { useNavigate } from 'react-router-dom';

function PortfolioPage() {
    // atom
    const [portfolios] = useAtom(allPortfolios);
    const [portfolioBasicData] = useAtom(selectedPortfolio);
    const [portfolioData] = useAtom(portfolioItems);
    const [selectedPortfolioId] = useAtom(selectedPortfolioIdAtom);
    const getAllPortfolios = useSetAtom(getAllPortfoliosAtom);
    const getPortfolioItemsById = useSetAtom(getPortfolioItemsByIdAtom);
    const setCurrentPortfolio = useSetAtom(setCurrentPortfolioAtom);
    const deleteCurrentPortfolio = useSetAtom(deleteCurrentPortfolioAtom);
    //
    const [togglePortfolioCreateModal, setTogglePortfolioCreateModal] = useState(false);
    const [toggleDropdown, setToggleDropdown] = useState(false);
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
    }, [portfolios, getPortfolioItemsById, selectedPortfolioId, getAllPortfolios]);

    const handleNavigateToTransactionPage = () => {
        navigate('/transactions');
    };

    const handleDeletePortfolio = async () => {
        await deleteCurrentPortfolio();
    };

    return (
        <div className={style.pageWrapper}>
            <div className={style.header}>
                <div className={style.rowWrapper}>
                    <div className={style.title}>
                        내 포트폴리오 |{' '}
                        {portfolios.find((item) => item._id === selectedPortfolioId)?.name}
                    </div>
                    <div className={style.dropDown}>
                        <ChevronDown
                            className={style.dropDownIcon}
                            onClick={() => setToggleDropdown(!toggleDropdown)}
                        />
                        <div className={style.dropDown__wrapper}>
                            {toggleDropdown &&
                                portfolios.map((portfolio) => (
                                    <button
                                        className={style.dropDown__button}
                                        key={portfolio._id}
                                        onClick={() => {
                                            setCurrentPortfolio(portfolio._id);
                                            setToggleDropdown(false);
                                        }}>
                                        {portfolio.name}
                                    </button>
                                ))}
                        </div>
                    </div>
                </div>

                <div className={style.rowWrapper}>
                    <button
                        className={style.createButton}
                        onClick={handleNavigateToTransactionPage}>
                        거래내역
                    </button>

                    <button
                        className={style.createButton}
                        onClick={() => setTogglePortfolioCreateModal(true)}>
                        새 포트폴리오 만들기
                    </button>
                    <button
                        className={`${style.createButton} ${style.delete}`}
                        onClick={() => handleDeletePortfolio()}>
                        포트폴리오 삭제
                    </button>
                </div>
            </div>

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
                        {portfolioData
                            ? portfolioData.map((portfolio) => (
                                  <tr key={portfolio.ticker}>
                                      <td>{portfolio.ticker}</td>
                                      <td>{portfolio.name}</td>
                                      <td>{portfolio.averagePrice.toFixed(2)}</td>
                                      <td className={style.currentPrice}>
                                          {portfolio.currentPrice}
                                      </td>
                                      <td
                                          className={`${style.returnRate} ${
                                              portfolio.returnRate > 0 ? style.profit : style.loss
                                          }`}>
                                          {portfolio.returnRate.toFixed(1)}%
                                      </td>
                                      <td>
                                          {portfolio.totalValue.toFixed(1)}
                                          {portfolioBasicData?.baseCurrency}
                                      </td>
                                  </tr>
                              ))
                            : ''}
                    </tbody>
                </table>
            </div>

            {togglePortfolioCreateModal && (
                <div
                    className={modalStyle.overlay}
                    onClick={() => setTogglePortfolioCreateModal(false)}>
                    <PortfolioCreateModal onClose={() => setTogglePortfolioCreateModal(false)} />
                </div>
            )}
        </div>
    );
}

export default PortfolioPage;
