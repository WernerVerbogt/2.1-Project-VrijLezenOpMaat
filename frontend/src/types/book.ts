// Typecontract for the book

export interface Book {
    id: string,
    title: string,
    author: string,
    description: string,
    materialType: string,
    length: string,
    level: string,
    themes: string[];
}