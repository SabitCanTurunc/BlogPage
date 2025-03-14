export interface Post {
    id: number;
    title: string;
    content: string;
    userEmail: string;
    categoryId: number;
    categoryName: string;
    images: string[];
    createdAt: string;
    updatedAt: string;
} 