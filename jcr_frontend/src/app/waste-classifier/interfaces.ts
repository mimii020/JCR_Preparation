export interface Detection {
    classId: number;
    className: string;
    confidence: number;
    bbox: [number, number, number, number];
}