import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from 'lucide-react';

// Configure the worker for pdfjs (required by react-pdf)
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  url: string;
  originalName: string;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ url, originalName }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      return Math.min(Math.max(1, newPageNumber), numPages || 1);
    });
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  const zoomIn = () => setScale(prevScale => Math.min(prevScale + 0.2, 3.0));
  const zoomOut = () => setScale(prevScale => Math.max(prevScale - 0.2, 0.5));

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden rounded-b-xl">
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-gray-100 p-2 border-b">
        <div className="flex items-center gap-2">
          <button 
            onClick={previousPage} 
            disabled={pageNumber <= 1}
            className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm">
            Page {pageNumber || (numPages ? 1 : '--')} of {numPages || '--'}
          </span>
          <button 
            onClick={nextPage} 
            disabled={pageNumber >= (numPages || 1)}
            className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={zoomOut} className="p-1 rounded hover:bg-gray-200" title="Zoom Out">
            <ZoomOut size={18} />
          </button>
          <span className="text-sm w-12 text-center">{Math.round(scale * 100)}%</span>
          <button onClick={zoomIn} className="p-1 rounded hover:bg-gray-200" title="Zoom In">
            <ZoomIn size={18} />
          </button>
        </div>

        <a 
          href={url} 
          download={originalName}
          className="flex items-center gap-1 text-sm bg-primary-600 text-white px-3 py-1.5 rounded hover:bg-primary-700 transition"
        >
          <Download size={16} />
          Download
        </a>
      </div>

      {/* Document View */}
      <div className="flex-1 overflow-auto flex justify-center p-4">
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          }
          error={
            <div className="text-red-500 font-medium">
              Failed to load PDF file. Please try downloading it.
            </div>
          }
        >
          <Page 
            pageNumber={pageNumber} 
            scale={scale} 
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="shadow-lg bg-white"
          />
        </Document>
      </div>
    </div>
  );
};
