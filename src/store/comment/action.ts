import { atom } from 'jotai';
import { idTokenAtom } from '../auth/atoms';
import axios from 'axios';
import { SERVER_IP } from '../../constants/env';
import { SelectedCommentDataAtom } from './atoms';
import { SelectedPostDataAtom } from '../post/atoms';

// 게시물 댓글 불러오기
export const getCommentDataAtom = atom(null, async (get, set) => {
    try {
        const token = get(idTokenAtom);
        const postId = get(SelectedPostDataAtom)?._id;
        const res = await axios.get(`${SERVER_IP}/api/posts/${postId}/comments`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        set(SelectedCommentDataAtom, res.data);
    } catch (error) {
        console.error('커뮤니티 게시물 조회 실패: ', error);
        throw new Error();
    }
});

// 댓글 작성하기
export const postCommentDataAtom = atom(null, async (get, set, content: string) => {
    try {
        const token = get(idTokenAtom);
        const postId = get(SelectedPostDataAtom)?._id;
        const data = { content: content, parentComment: null };
        await axios.post(`${SERVER_IP}/api/posts/${postId}/comments`, data, {
            headers: { Authorization: `Bearer ${token}` },
        });
        await set(getCommentDataAtom);
    } catch (error) {
        console.error('댓글 작성 실패: ', error);
        throw new Error();
    }
});

// 댓글 수정하기
export const putCommentDataAtom = atom(
    null,
    async (get, set, content: string, commentId: string) => {
        try {
            const token = get(idTokenAtom);
            const postId = get(SelectedPostDataAtom)?._id;
            const data = { content: content, parentComment: null };
            await axios.put(`${SERVER_IP}/api/posts/${postId}/comments/${commentId}`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });
            await set(getCommentDataAtom);
        } catch (error) {
            console.error('댓글 수정 실패: ', error);
            throw new Error();
        }
    }
);

// 댓글 삭제하기
export const deleteCommentDataAtom = atom(null, async (get, set, commentId: string) => {
    try {
        const token = get(idTokenAtom);
        const postId = get(SelectedPostDataAtom)?._id;

        await axios.delete(`${SERVER_IP}/api/posts/${postId}/comments/${commentId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        await set(getCommentDataAtom);
    } catch (error) {
        console.error('댓글 수정 실패: ', error);
        throw new Error();
    }
});
