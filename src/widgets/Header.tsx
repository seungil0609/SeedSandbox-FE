import { NavLink, useNavigate } from "react-router-dom";
import style from "./styles/Header.module.scss";
import { Menu } from "lucide-react";
import SearchBar from "./SearchBar";

function Header() {
  const navigate = useNavigate();

  const headerInfo = [
    { id: "대시보드", path: "/dashboard" },
    { id: "포트폴리오", path: "/portfolio" },
    { id: "거래내역", path: "/transactions" },
    { id: "커뮤니티", path: "/community" },
    { id: "마이페이지", path: "/my" },
  ] as const;

  return (
    <div className={style.header}>
      <div className={style.rowWrapper}>
        {/* 🔻 [수정됨] a 태그 -> span 태그로 변경, href 제거 */}
        <span className={style.logo} style={{ cursor: "default" }}>
          SeedSandbox
        </span>
        <SearchBar />
      </div>

      <nav className={style.header__buttonRail}>
        {headerInfo.map((item) => (
          <NavLink
            to={item.path}
            className={({ isActive }) =>
              isActive
                ? `${style.header__button} ${style.active}`
                : style.header__button
            }
            key={item.id}
            onClick={() => navigate(item.path)}
          >
            {item.id}
          </NavLink>
        ))}
      </nav>

      <button className={style.mobileMenuButton}>
        <Menu className={style.mobileMenuButton__icon} />
      </button>
    </div>
  );
}

export default Header;
