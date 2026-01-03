import { Share2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { useState } from 'react';

export default function ShareButton({ experience, size = 'sm' }) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}?page=ExperienceDetail&id=${experience.id}`;

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Link copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=Check out "${experience.title}" by ${experience.ownerName} on VANTA&url=${encodeURIComponent(url)}`, '_blank');
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size={size} variant="outline" className="border-neutral-700">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </PopoverTrigger>
      <PopoverContent className="bg-neutral-900 border-neutral-800 w-64">
        <div className="space-y-3">
          <h4 className="font-medium text-white text-sm">Share Experience</h4>
          
          <button
            onClick={copyLink}
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-neutral-400" />}
            <span className="text-sm text-white">Copy Link</span>
          </button>

          <button
            onClick={shareTwitter}
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors"
          >
            <div className="w-4 h-4 text-blue-400">𝕏</div>
            <span className="text-sm text-white">Share on Twitter</span>
          </button>

          <button
            onClick={shareFacebook}
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors"
          >
            <div className="w-4 h-4 text-blue-500">f</div>
            <span className="text-sm text-white">Share on Facebook</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}