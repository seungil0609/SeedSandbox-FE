import { atom } from 'jotai';
import type { User } from '../post/atoms';

export interface CommentData {
    _id: string;
    post: string;
    user: User;
    parentComment: string;
    content: string;
    createdAt: string;
    __v: number;
}

export interface CreateCommentData {
    content: string;
    parentComment: string;
}

export const SelectedCommentDataAtom = atom<CommentData[] | null>(null);
