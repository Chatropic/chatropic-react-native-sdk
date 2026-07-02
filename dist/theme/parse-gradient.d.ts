/** Parse CSS linear-gradient strings from dashboard accentGradient config. */
export interface ParsedGradient {
    colors: string[];
    locations: number[];
    start: {
        x: number;
        y: number;
    };
    end: {
        x: number;
        y: number;
    };
}
export declare function parseLinearGradient(css: string): ParsedGradient | null;
