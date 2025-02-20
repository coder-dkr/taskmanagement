import { FileSpreadsheet, ArrowUpRight } from 'lucide-react';

interface ExportButtonProps {
  onClick: () => void;
}

const ExportButton = ({ onClick }: ExportButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 rounded bg-green-600 hover:bg-green-700 transition-colors duration-200"
    >
      <FileSpreadsheet className="w-5 h-5" />
      <span>Export</span>
      <ArrowUpRight className="w-4 h-4" />
    </button>
  );
};

export default ExportButton;