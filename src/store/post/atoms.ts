import { atom } from 'jotai';

export interface User {
    _id: string;
    email: string;
    nickname: string;
}

export interface PostData {
    _id: string;
    user: User;
    boardType: string;
    title: string;
    content: string;
    createdAt: string;
    __v: number;
}

export interface CreatePostData {
    _id: string;
    userId: string;
    boardType: string;
    title: string;
    content: string;
    createdAt: string;
}

export const AllPostDataAtom = atom<PostData[] | null>(null);

export const SelectedPostDataAtom = atom<PostData | null>(null);
