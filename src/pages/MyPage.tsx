import { useAtom, useSetAtom } from "jotai";
import { deleteAccount, getProfileAtom, signOut } from "../store/auth/action";
import { useNavigate } from "react-router-dom";
import { idTokenAtom, UserProfileAtom } from "../store/auth/atoms";
import style from "./styles/MyPage.module.scss";
import { useEffect } from "react";

function MyPage() {
  const setLogout = useSetAtom(signOut);
  const setDeleteAccount = useSetAtom(deleteAccount);
  const getUserProfile = useSetAtom(getProfileAtom);
  const navigate = useNavigate();
  const [token] = useAtom(idTokenAtom);
  const [userProfile] = useAtom(UserProfileAtom);

  useEffect(() => {
    getUserProfile();
  }, []);

  const TEMP_TOKEN_VIEWER = () => {
    console.log(token);
    alert("콘솔창(F12)을 확인하세요.");
  };

  const handleLogout = async () => {
    // 1. 로그아웃 액션 실행 (Firebase SignOut + Atom 초기화)
    await setLogout();
    // 2. 로그인 페이지로 이동
    // replace: true를 써서 뒤로가기 했을 때 다시 마이페이지로 못 오게 함
    navigate("/signin", { replace: true });
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("정말로 탈퇴하시겠습니까? 모든 데이터가 삭제됩니다.")) {
      await setDeleteAccount();
      navigate("/signin", { replace: true });
    }
  };

  return (
    <div className={style.pageWrapper}>
      <div className={style.profileCard}>
        <h2 className={style.profileTitle}>회원 정보</h2>
        <div className={style.profileRow}>
          <span className={style.profileLabel}>이메일</span>
          <span className={style.profileValue}>{userProfile?.email}</span>
        </div>
        <div className={style.profileRow}>
          <span className={style.profileLabel}>닉네임</span>
          <span className={style.profileValue}>{userProfile?.nickname}</span>
        </div>
        <div className={style.profileRow}>
          <span className={style.profileLabel}>계정 생성 일자</span>
          <span className={style.profileValue}>
            {userProfile?.createdAt?.split("T")[0]}
          </span>
        </div>
      </div>

      <div className={style.section}>
        <button onClick={handleLogout} className={style.buttonPrimary}>
          로그아웃
        </button>
      </div>

      <div className={style.dangerZone}>
        <div className={style.dangerHeader}>
          <h2>Danger Zone</h2>
          <p>아래 작업은 계정 및 민감 정보에 영향을 줄 수 있습니다.</p>
        </div>
        <div className={style.dangerActions}>
          <button onClick={handleDeleteAccount} className={style.buttonDanger}>
            회원 탈퇴
          </button>
          <button
            onClick={TEMP_TOKEN_VIEWER}
            className={style.buttonOutlineDanger}
          >
            토큰 보기
          </button>
        </div>
      </div>
    </div>
  );
}

export default MyPage;
