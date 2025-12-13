import { atom } from "jotai";
import { idTokenAtom, UserProfileAtom } from "../auth/atoms";
import axios from "axios";
import { SERVER_IP } from "../../constants/env";
import { AllPostDataAtom, SelectedPostDataAtom } from "./atoms";
import { auth } from "../auth/firebase";

// 게시글 리스트 조회
export const getAllPostDataAtom = atom(null, async (get, set) => {
  try {
    const token = get(idTokenAtom);
    const res = await axios.get(`${SERVER_IP}/api/posts`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    set(AllPostDataAtom, res.data);
  } catch (error) {
    console.error("커뮤니티 게시물 조회 실패: ", error);
    throw new Error();
  }
});

// 게시물 상세 조회
export const getPostDataByIdAtom = atom(
  null,
  async (get, set, postId: string) => {
    try {
      const token = get(idTokenAtom);
      const res = await axios.get(`${SERVER_IP}/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set(SelectedPostDataAtom, res.data);
    } catch (error) {
      console.error("선택한 커뮤니티 게시물 조회 실패: ", error);
      throw new Error();
    }
  }
);

// 게시글 작성
export const createPostDataAtom = atom(
  null,
  async (get, set, boardType: string, title: string, content: string) => {
    try {
      const token = get(idTokenAtom);
      const userId = get(UserProfileAtom)?.id;
      const data = {
        user: userId,
        boardType: boardType,
        title: title,
        content: content,
        createdAt: new Date().toISOString(),
      };
      await axios.post(`${SERVER_IP}/api/posts`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await set(getAllPostDataAtom);
    } catch (error) {
      console.error("게시물 작성 실패: ", error);
      throw new Error();
    }
  }
);

// 게시물 수정
export const putPostDataAtom = atom(
  null,
  async (
    get,
    set,
    postId: string,
    boardType: string,
    title: string,
    content: string
  ) => {
    try {
      const token = get(idTokenAtom);
      const data = {
        title: title,
        content: content,
        boardType: boardType,
      };
      await axios.put(`${SERVER_IP}/api/posts/${postId}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await set(getAllPostDataAtom);
    } catch (error) {
      console.error("게시물 수정 실패: ", error);
      throw new Error();
    }
  }
);

// 🟢 [추가] 게시글 삭제 Action Atom
export const deletePostByIdAtom = atom(
  null,
  async (get, set, postId: string) => {
    const token = await auth.currentUser?.getIdToken();
    if (!token) return;

    try {
      // 1. 백엔드 API 호출 (DELETE 요청)
      await axios.delete(`${SERVER_IP}/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 2. 성공 시, 로컬 상태(AllPostDataAtom)에서 해당 게시글 제거하여 즉시 반영
      const currentPosts = get(AllPostDataAtom);
      if (currentPosts) {
        set(
          AllPostDataAtom,
          currentPosts.filter((post) => post._id !== postId)
        );
      }

      alert("게시글이 삭제되었습니다.");
    } catch (error) {
      console.error("게시글 삭제 실패:", error);
      alert("게시글 삭제에 실패했습니다.");
    }
  }
);
