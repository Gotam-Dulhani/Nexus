import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FileText, Upload, Download, Trash2, Eye, PenTool, X, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { PDFViewer } from '../../components/documents/PDFViewer';
import { useAuth, BACKEND_URL } from '../../context/AuthContext';
import { apiGet, apiUpload, apiDelete, apiPost } from '../../utils/api';

interface Doc {
  _id: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  status: string;
  signature: string;
  createdAt: string;
  owner: { name: string; email: string };
}

export const DocumentsPage: React.FC = () => {
  const { token } = useAuth();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<Doc | null>(null);
  const [signDoc, setSignDoc] = useState<Doc | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signSaved, setSignSaved] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocs = useCallback(async () => {
    try {
      const data = await apiGet<Doc[]>('/documents', token);
      setDocs(data);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      alert('File size exceeds 20MB limit. Please choose a smaller file.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('document', file);
    try {
      const newDoc = await apiUpload<Doc>('/documents/upload', formData, token);
      setDocs(prev => [newDoc, ...prev]);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this document?')) return;
    try {
      await apiDelete(`/documents/${id}`, token);
      setDocs(prev => prev.filter(d => d._id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  // E-Signature canvas
  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      const rect = canvasRef.current!.getBoundingClientRect();
      ctx.beginPath();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext('2d');
    const rect = canvasRef.current!.getBoundingClientRect();
    if (ctx) {
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
  };

  const clearCanvas = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx && canvasRef.current) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    setSignSaved(false);
  };

  const saveSignature = async () => {
    if (!signDoc || !canvasRef.current) return;
    const signature = canvasRef.current.toDataURL('image/png');
    try {
      const updatedDoc = await apiPost<any>(`/documents/${signDoc._id}/sign`, { signature }, token);
      setDocs(prev => prev.map(d => d._id === signDoc._id ? { ...d, signature } : d));
      setSignSaved(true);
    } catch (e) {
      console.error(e);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600">Upload, preview, and sign your documents</p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.xlsx,.xls,.png,.jpg,.jpeg"
            className="hidden"
            onChange={handleUpload}
          />
          <Button
            leftIcon={<Upload size={18} />}
            onClick={() => fileInputRef.current?.click()}
            isLoading={uploading}
          >
            Upload Document
          </Button>
        </div>
      </div>

      {/* Document List */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">All Documents ({docs.length})</h2>
        </CardHeader>
        <CardBody>
          {docs.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No documents yet. Upload your first document!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {docs.map(doc => (
                <div
                  key={doc._id}
                  className="flex items-center p-4 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100"
                >
                  <div className="p-2 bg-primary-50 rounded-lg mr-4">
                    <FileText size={24} className="text-primary-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{doc.originalName}</h3>
                      {doc.signature && <Badge variant="success" size="sm">Signed</Badge>}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span>{doc.mimeType.split('/')[1]?.toUpperCase()}</span>
                      <span>{formatSize(doc.size)}</span>
                      <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 ml-4">
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Preview"
                    >
                      <Eye size={18} />
                    </button>

                    <a
                      href={`${BASE}${doc.url}`}
                      download={doc.originalName}
                      className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download size={18} />
                    </a>

                    <button
                      onClick={() => { setSignDoc(doc); setSignSaved(false); }}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Sign"
                    >
                      <PenTool size={18} />
                    </button>

                    <button
                      onClick={() => handleDelete(doc._id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* PDF Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="font-semibold text-gray-900 truncate">{previewDoc.originalName}</h3>
              <button onClick={() => setPreviewDoc(null)} className="text-gray-400 hover:text-gray-600">
                <X size={22} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden" style={{ minHeight: 0 }}>
              {previewDoc.mimeType === 'application/pdf' ? (
                <PDFViewer url={`${BASE}${previewDoc.url}`} originalName={previewDoc.originalName} />
              ) : previewDoc.mimeType.startsWith('image/') ? (
                <div className="flex items-center justify-center h-full p-4 overflow-auto">
                  <img
                    src={`${BASE}${previewDoc.url}`}
                    alt={previewDoc.originalName}
                    className="max-h-full max-w-full object-contain rounded"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <FileText size={48} className="text-gray-300 mb-3" />
                  <p>Preview not available for this file type.</p>
                  <a
                    href={`${BASE}${previewDoc.url}`}
                    download={previewDoc.originalName}
                    className="mt-3 text-primary-600 hover:underline text-sm"
                  >
                    Download to view
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* E-Signature Modal */}
      {signDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="font-semibold text-gray-900">Sign Document</h3>
              <button onClick={() => setSignDoc(null)} className="text-gray-400 hover:text-gray-600">
                <X size={22} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-3">
                Draw your signature below for: <span className="font-medium">{signDoc.originalName}</span>
              </p>
              <canvas
                ref={canvasRef}
                width={500}
                height={150}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg cursor-crosshair bg-gray-50"
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={() => setIsDrawing(false)}
                onMouseLeave={() => setIsDrawing(false)}
              />
              {signSaved && (
                <div className="flex items-center gap-2 text-green-600 text-sm mt-2">
                  <CheckCircle size={16} />
                  Signature saved successfully!
                </div>
              )}
              <div className="flex gap-3 mt-4">
                <Button variant="outline" fullWidth onClick={clearCanvas}>Clear</Button>
                <Button fullWidth onClick={saveSignature} leftIcon={<PenTool size={16} />}>
                  Save Signature
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};