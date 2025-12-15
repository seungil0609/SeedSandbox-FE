import { Link, useNavigate } from "react-router-dom";
import GuestHeader from "../widgets/GuestHeader";
import style from "./styles/SignUpPage.module.scss";
import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  signOut,
  updateProfile,
} from "firebase/auth"; // 🟢 deleteUser 추가
import { FirebaseError } from "firebase/app";
import { auth } from "../store/auth/firebase";
import { useSetAtom } from "jotai";
import { idTokenAtom, isAuthenticatedAtom } from "../store/auth/atoms";
import axios from "axios";
import { SERVER_IP } from "../constants/env";

function SignUpPage() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [nickName, setNickName] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false); // 로딩 상태 추가

  const navigate = useNavigate();

  const setToken = useSetAtom(idTokenAtom);
  const setAuth = useSetAtom(isAuthenticatedAtom);

  const handleSignUpError = (error: any) => {
    // 1. Firebase 에러
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case "auth/email-already-in-use":
          setStatus("이미 가입된 이메일입니다. 로그인을 진행해주세요.");
          break;
        case "auth/invalid-email":
          setStatus("올바른 이메일 형식이 아닙니다.");
          break;
        case "auth/weak-password":
          setStatus("비밀번호는 최소 6자 이상이어야 합니다.");
          break;
        default:
          setStatus(`오류가 발생했습니다: ${error.code}`);
      }
    }
    // 2. 백엔드(Axios) 에러
    else if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      const msg = error.response.data?.message || "";

      if (status === 409) {
        // 🟢 닉네임 중복과 이메일 중복을 구분 (백엔드 메시지에 따라)
        if (msg.includes("nickname") || msg.includes("닉네임")) {
          setStatus("이미 사용 중인 닉네임입니다.");
        } else {
          setStatus("이미 가입된 이메일입니다.");
          alert("이미 가입된 이메일입니다. 로그인 페이지로 이동합니다.");
          navigate("/signin");
        }
      } else {
        setStatus(
          "서버 등록 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
        );
      }
    } else {
      setStatus("알 수 없는 오류가 발생했습니다.");
    }
    // 3초 뒤 에러 메시지 초기화 (선택 사항)
    // setTimeout(() => setStatus(""), 3000);
  };

  const handleSignUp = async () => {
    setStatus(""); // 기존 메시지 초기화

    // --- 유효성 검사 ---
    if (!id.includes("@")) {
      setStatus("올바른 이메일 형식이 아닙니다.");
      return;
    }
    if (!nickName) {
      setStatus("닉네임을 입력해주세요.");
      return;
    }
    if (password.length < 6) {
      setStatus("비밀번호는 6자 이상이어야 합니다.");
      return;
    }
    if (password !== passwordConfirm) {
      setStatus("비밀번호가 일치하지 않습니다.");
      return;
    }

    setLoading(true); // 로딩 시작

    let userCredential;

    try {
      // 🟢 [STEP 1] 백엔드에 중복 여부 먼저 확인 (Pre-check)
      // 이 단계에서는 Firebase 계정이 생성되지 않으므로 리스너가 반응하지 않음 -> 에러 메시지 표시 가능!
      await axios.post(`${SERVER_IP}/api/users/check`, {
        email: id,
        nickname: nickName,
      });

      // 🟢 [STEP 2] 중복이 아니라면, 이제 Firebase 계정 생성
      userCredential = await createUserWithEmailAndPassword(auth, id, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: nickName });
      const token = await user.getIdToken();

      // 🟢 [STEP 3] 백엔드에 최종 등록 요청
      await axios.post(
        `${SERVER_IP}/api/users/register`,
        {
          firebaseUid: user.uid,
          email: id,
          nickname: nickName,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // 성공 처리
      setToken(token);
      setAuth(true);
      alert("회원가입이 완료되었습니다!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("회원가입 프로세스 실패:", error);

      // 만약 [STEP 2] 성공 후 [STEP 3]에서 터졌다면 롤백 필요
      if (userCredential && userCredential.user) {
        try {
          await deleteUser(userCredential.user);
        } catch (deleteErr) {
          await signOut(auth);
        }
      }

      setToken(null);
      setAuth(false);
      handleSignUpError(error); // 이제 여기서 에러 메시지가 정상적으로 뜹니다!
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <GuestHeader />
      <div className={style.pageWrapper}>
        <section className={style.signUpSection}>
          <h1>SeedSandbox과 함께해요!</h1>
          <p>부담없이 모의로 주식 포트폴리오 관리를 시작해보세요.</p>

          <form
            className={style.form}
            onSubmit={(e) => {
              e.preventDefault();
              handleSignUp();
            }}
          >
            <div className={style.inputGroup}>
              <label>아이디(이메일)</label>
              <input
                className={style.input}
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="example@email.com"
              />
            </div>

            <div className={style.inputGroup}>
              <label>닉네임</label>
              <input
                className={style.input}
                value={nickName}
                onChange={(e) => setNickName(e.target.value)}
                placeholder="닉네임 입력"
              />
            </div>

            <div className={style.inputGroup}>
              <label>비밀번호</label>
              <input
                className={style.input}
                value={password}
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6자 이상 입력"
              />
            </div>

            <div className={style.inputGroup}>
              <label>비밀번호 재입력</label>
              <input
                className={style.input}
                value={passwordConfirm}
                type="password"
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="비밀번호 확인"
              />
            </div>

            <div className={style.rowWrapper}>
              {/* 에러 메시지 스타일 적용 (빨간색) */}
              <label
                className={style.status}
                style={{ color: "#ff6b6b", minHeight: "20px" }}
              >
                {status}
              </label>
            </div>

            <button
              className={style.submitButton}
              type="submit"
              disabled={loading} // 로딩 중 버튼 비활성화
              style={{
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "처리 중..." : "회원가입"}
            </button>
          </form>
        </section>
        <div className={style.rowWrapper}>
          <p>이미 계정이 있으신가요?</p>
          <Link to="/signin" className={style.loginTextButton}>
            로그인
          </Link>
        </div>
      </div>
    </>
  );
}

export default SignUpPage;
