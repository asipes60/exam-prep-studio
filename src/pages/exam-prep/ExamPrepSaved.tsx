import { useState, useMemo } from 'react';
import { useExamPrep } from '@/contexts/ExamPrepContext';
import { EXAM_DATA, STUDY_FORMAT_OPTIONS } from '@/data/exam-prep-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { LicenseType, StudyFormat, SavedMaterial } from '@/types/exam-prep';
import {
  Search,
  Star,
  StarOff,
  Trash2,
  FolderPlus,
  Folder,
  Filter,
  Copy,
  Printer,
  LayoutDashboard,
  FileText,
  Clock,
  BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ExamPrepSaved() {
  const {
    savedMaterials,
    folders,
    toggleFavorite,
    deleteMaterial,
    createFolder,
    deleteFolder,
    refreshSavedMaterials,
  } = useExamPrep();

  const [search, setSearch] = useState('');
  const [filterLicense, setFilterLicense] = useState<string>('all');
  const [filterFormat, setFilterFormat] = useState<string>('all');
  const [filterFolder, setFilterFolder] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [expandedMaterial, setExpandedMaterial] = useState<string | null>(null);

  const filteredMaterials = useMemo(() => {
    let items = [...savedMaterials];
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.topic.toLowerCase().includes(q) ||
          m.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (filterLicense !== 'all') items = items.filter((m) => m.licenseType === filterLicense);
    if (filterFormat !== 'all') items = items.filter((m) => m.studyFormat === filterFormat);
    if (filterFolder !== 'all') items = items.filter((m) => m.folderId === filterFolder);
    if (showFavoritesOnly) items = items.filter((m) => m.isFavorite);
    return items;
  }, [savedMaterials, search, filterLicense, filterFormat, filterFolder, showFavoritesOnly]);

  function handleCreateFolder() {
    if (!newFolderName.trim()) return;
    createFolder(newFolderName.trim());
    setNewFolderName('');
    setFolderDialogOpen(false);
    toast.success('Folder created');
  }

  function handleDelete(id: string) {
    deleteMaterial(id);
    toast.success('Material deleted');
  }

  function handleCopy(material: SavedMaterial) {
    navigator.clipboard.writeText(JSON.stringify(material.content, null, 2));
    toast.success('Content copied to clipboard');
  }

  function getFormatLabel(format: StudyFormat): string {
    return STUDY_FORMAT_OPTIONS.find((o) => o.id === format)?.label || format;
  }

  function getLicenseLabel(license: LicenseType): string {
    return EXAM_DATA[license]?.shortTitle || license;
  }

  return (
    <div className="container-custom py-8 md:py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="heading-2 text-slate-900 mb-1">My Materials</h1>
          <p className="text-slate-500">
            {savedMaterials.length} saved {savedMaterials.length === 1 ? 'item' : 'items'}
          </p>
        </div>
        <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <FolderPlus className="w-4 h-4 mr-1.5" />
              New Folder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Folder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <Input
                placeholder="Folder name..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              />
              <Button onClick={handleCreateFolder} className="w-full bg-blue-600 hover:bg-blue-700">
                Create Folder
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search materials..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterLicense} onValueChange={setFilterLicense}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="All Licenses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Licenses</SelectItem>
              {Object.values(EXAM_DATA).map((exam) => (
                <SelectItem key={exam.id} value={exam.id}>
                  {exam.shortTitle}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterFormat} onValueChange={setFilterFormat}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="All Formats" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Formats</SelectItem>
              {STUDY_FORMAT_OPTIONS.map((opt) => (
                <SelectItem key={opt.id} value={opt.id}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant={showFavoritesOnly ? 'default' : 'outline'}
            size="icon"
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            title="Show favorites only"
            className={showFavoritesOnly ? 'bg-amber-500 hover:bg-amber-600' : ''}
          >
            <Star className="w-4 h-4" />
          </Button>
        </div>

        {/* Folders Row */}
        {folders.length > 0 && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 flex-wrap">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <Button
              variant={filterFolder === 'all' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setFilterFolder('all')}
            >
              All
            </Button>
            {folders.map((folder) => (
              <Button
                key={folder.id}
                variant={filterFolder === folder.id ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setFilterFolder(folder.id)}
              >
                <Folder className="w-3 h-3 mr-1" />
                {folder.name}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Materials Grid */}
      {filteredMaterials.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <LayoutDashboard className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="font-semibold text-slate-600 mb-1">
            {savedMaterials.length === 0 ? 'No Saved Materials Yet' : 'No Results Found'}
          </h3>
          <p className="text-sm text-slate-400">
            {savedMaterials.length === 0
              ? 'Generate study materials and save them to build your library.'
              : 'Try adjusting your search or filters.'}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaterials.map((material) => (
            <Card
              key={material.id}
              className="border-slate-200 hover:border-blue-200 hover:shadow-md transition-all group"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-sm text-slate-800 truncate">
                      {material.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(material.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleFavorite(material.id)}
                    className="text-slate-300 hover:text-amber-500 transition-colors"
                  >
                    {material.isFavorite ? (
                      <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    ) : (
                      <Star className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  <Badge variant="secondary" className="text-xs">
                    {getLicenseLabel(material.licenseType)}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {getFormatLabel(material.studyFormat)}
                  </Badge>
                </div>

                <p className="text-xs text-slate-500 mb-4 line-clamp-2">
                  Topic: {material.topic}
                </p>

                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs flex-1"
                    onClick={() => handleCopy(material)}
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs flex-1"
                    onClick={() => window.print()}
                  >
                    <Printer className="w-3 h-3 mr-1" />
                    Print
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-red-500 hover:text-red-700"
                    onClick={() => handleDelete(material.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
