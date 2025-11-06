import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FileText, Plus } from "lucide-react";
import { useMessageTemplates } from "@/hooks/useMessageTemplates";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TemplateSelectorProps {
  onSelect: (content: string) => void;
  disabled?: boolean;
}

export const TemplateSelector = ({ onSelect, disabled }: TemplateSelectorProps) => {
  const { templates, loading, createTemplate } = useMessageTemplates();
  const [open, setOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const handleSelectTemplate = (content: string) => {
    onSelect(content);
    setOpen(false);
  };

  const handleCreate = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;

    await createTemplate(newTitle, newContent);
    setNewTitle('');
    setNewContent('');
    setShowCreateForm(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={disabled}
          title="Πρότυπα μηνυμάτων"
        >
          <FileText className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Πρότυπα Μηνυμάτων</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Νέο
            </Button>
          </div>

          {showCreateForm && (
            <div className="space-y-2 p-3 border rounded-lg bg-muted/30">
              <Input
                placeholder="Τίτλος προτύπου"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              <Textarea
                placeholder="Περιεχόμενο μηνύματος..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="min-h-[80px]"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCreate}>
                  Αποθήκευση
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Ακύρωση
                </Button>
              </div>
            </div>
          )}

          <ScrollArea className="h-[300px]">
            {loading ? (
              <div className="text-sm text-muted-foreground text-center py-4">
                Φόρτωση...
              </div>
            ) : templates.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-4">
                Δεν υπάρχουν πρότυπα. Δημιούργησε το πρώτο σου!
              </div>
            ) : (
              <div className="space-y-2">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template.content)}
                    className="w-full text-left p-3 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="font-medium text-sm">{template.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {template.content}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
};
