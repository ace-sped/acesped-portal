declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf';

  interface RowInput {
    [key: string]: any;
  }

  interface CellDef {
    content?: string | number;
    colSpan?: number;
    rowSpan?: number;
    styles?: Partial<Styles>;
  }

  interface Styles {
    font?: string;
    fontStyle?: 'normal' | 'bold' | 'italic' | 'bolditalic';
    overflow?: 'linebreak' | 'ellipsize' | 'visible' | 'hidden';
    fillColor?: number | number[] | false;
    textColor?: number | number[];
    cellWidth?: 'auto' | 'wrap' | number;
    minCellHeight?: number;
    minCellWidth?: number;
    halign?: 'left' | 'center' | 'right' | 'justify';
    valign?: 'top' | 'middle' | 'bottom';
    fontSize?: number;
    cellPadding?: number | number[];
    lineColor?: number | number[];
    lineWidth?: number;
  }

  interface UserOptions {
    head?: (string | CellDef)[][];
    body?: (string | number | CellDef)[][];
    foot?: (string | CellDef)[][];
    startY?: number;
    margin?: number | { top?: number; right?: number; bottom?: number; left?: number };
    styles?: Partial<Styles>;
    headStyles?: Partial<Styles>;
    bodyStyles?: Partial<Styles>;
    footStyles?: Partial<Styles>;
    alternateRowStyles?: Partial<Styles>;
    columnStyles?: { [key: string]: Partial<Styles> };
    theme?: 'striped' | 'grid' | 'plain';
    didDrawPage?: (data: any) => void;
    didDrawCell?: (data: any) => void;
    willDrawCell?: (data: any) => void;
    didParseCell?: (data: any) => void;
  }

  function autoTable(doc: jsPDF, options: UserOptions): void;

  export default autoTable;
}

