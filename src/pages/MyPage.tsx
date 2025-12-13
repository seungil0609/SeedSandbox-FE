import { useAtom, useSetAtom } from "jotai";
import { deleteAccount, getProfileAtom, signOut } from "../store/auth/action";
import { useNavigate } from "react-router-dom";
import { UserProfileAtom } from "../store/auth/atoms";
import style from "./styles/MyPage.module.scss";
import { useEffect, useState } from "react";
import {
  User,
  Calendar,
  LogOut,
  Trash2,
  Mail,
  Shield,
  Settings,
} from "lucide-react";

// 사이드바 메뉴 목록
const MENU_ITEMS = [
  { id: "info", label: "내 정보" },
  { id: "account", label: "계정 관리" },
];

function MyPage() {
  const setLogout = useSetAtom(signOut);
  const setDeleteAccount = useSetAtom(deleteAccount);
  const getUserProfile = useSetAtom(getProfileAtom);
  const navigate = useNavigate();
  const [userProfile] = useAtom(UserProfileAtom);

  // 🟢 [신규] 현재 선택된 탭 상태 ('info'가 기본값)
  const [activeTab, setActiveTab] = useState("info");

  useEffect(() => {
    getUserProfile();
  }, []);

  const handleLogout = async () => {
    await setLogout();
    navigate("/signin");
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("정말로 탈퇴하시겠습니까? 모든 데이터가 삭제됩니다.")) {
      await setDeleteAccount();
      navigate("/signin");
    }
  };

  // 날짜 포맷팅 (YYYY.MM.DD)
  const joinDate = userProfile?.createdAt
    ? userProfile.createdAt.split("T")[0].replace(/-/g, ".")
    : "-";

  return (
    <div className={style.pageWrapper}>
      <div className={style.header}>
        <div className={style.title}>마이페이지</div>
      </div>

      <div className={style.contentContainer}>
        {/* 🟢 1. 왼쪽 사이드바 */}
        <aside className={style.sidebar}>
          <div className={style.sidebarHeader}>설정</div>
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`${style.sidebarItem} ${
                activeTab === item.id ? style.active : ""
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </aside>

        {/* 🟢 2. 오른쪽 메인 콘텐츠 (탭에 따라 변경) */}
        <div className={style.mainContent}>
          {/* [탭 1] 내 정보 화면 */}
          {activeTab === "info" && (
            <div className={style.card}>
              <div className={style.profileHeader}>
                <div className={style.avatarWrapper}>
                  <User size={40} color="#fff" />
                </div>
                <div className={style.profileTexts}>
                  <div className={style.nickname}>
                    {userProfile?.nickname || "사용자"}
                  </div>
                </div>
              </div>

              <div className={style.divider} />

              <div className={style.infoRow}>
                <div className={style.labelIcon}>
                  <Mail size={18} />
                  <span>이메일 계정</span>
                </div>
                <span className={style.valueText}>{userProfile?.email}</span>
              </div>

              <div className={style.infoRow}>
                <div className={style.labelIcon}>
                  <Calendar size={18} />
                  <span>가입일</span>
                </div>
                <span className={style.valueText}>{joinDate}</span>
              </div>
            </div>
          )}

          {/* [탭 2] 계정 관리 화면 */}
          {activeTab === "account" && (
            <div className={style.card}>
              <p className={style.cardDesc}>
                계정 로그아웃 및 탈퇴를 진행할 수 있습니다.
              </p>

              <div className={style.actionButtons}>
                <button className={style.menuButton} onClick={handleLogout}>
                  <div className={style.iconBox}>
                    <LogOut size={18} />
                  </div>
                  <div className={style.btnTextWrapper}>
                    <span className={style.menuText}>로그아웃</span>
                    <span className={style.menuSubText}>
                      현재 기기에서 로그아웃합니다.
                    </span>
                  </div>
                </button>

                <button
                  className={`${style.menuButton} ${style.danger}`}
                  onClick={handleDeleteAccount}
                >
                  <div className={style.iconBox}>
                    <Trash2 size={18} />
                  </div>
                  <div className={style.btnTextWrapper}>
                    <span className={style.menuText}>회원 탈퇴</span>
                    <span className={style.menuSubText}>
                      계정과 모든 데이터를 영구 삭제합니다.
                    </span>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyPage;
