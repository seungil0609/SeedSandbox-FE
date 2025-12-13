import { Menu } from "lucide-react";
import style from "./styles/Header.module.scss";

function GuestHeader() {
  return (
    <div className={style.header}>
      {/* 🔻 [수정됨] a -> span, href 제거, 커서 기본값 설정 */}
      <span className={style.logo} style={{ cursor: "default" }}>
        SeedUp
      </span>
      <button className={style.mobileMenuButton}>
        <Menu className={style.mobileMenuButton__icon} />
      </button>
    </div>
  );
}

export default GuestHeader;
