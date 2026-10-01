/**
 * Represents a normalized book as used inside the application.
 * The original MongoDB document remains unchanged as this remains a proof of concept.
 * Below are the properties that are represented in the document database.
 */

export interface CatalogBook {
    id: string;
    title: string;
    author: string;
    description: string;
    materialType: string;
    level: string;
    themes: string[];
}