export interface Comment {
    id?: number;
    comment: string;
    postId: number;
    userEmail: string;
    username: string;
    createdAt?: Date;
    updatedAt?: Date;
} 