export interface Comment {
    id?: number;
    comment: string;
    postId: number;
    userEmail: string;
    username: string;
    userId?: number;
    createdAt?: Date;
    updatedAt?: Date;
} 