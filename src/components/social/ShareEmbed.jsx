import { useState } from 'react';
import { Share2, Copy, Check, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function ShareEmbed({ experience }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/experience/${experience.id}`;
  const embedCode = `<iframe src="${shareUrl}/embed" width="100%" height="400" frameborder="0"></iframe>`;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToSocial = (platform) => {
    const urls = {
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(experience.title)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    };
    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="border-neutral-700">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-neutral-900 border-neutral-800">
        <DialogHeader>
          <DialogTitle className="text-white">Share Experience</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="link">
          <TabsList className="bg-neutral-800 w-full">
            <TabsTrigger value="link" className="flex-1">Link</TabsTrigger>
            <TabsTrigger value="embed" className="flex-1">Embed</TabsTrigger>
            <TabsTrigger value="social" className="flex-1">Social</TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-3">
            <div className="flex gap-2">
              <Input value={shareUrl} readOnly className="bg-neutral-800 border-neutral-700" />
              <Button onClick={() => copyToClipboard(shareUrl)}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="embed" className="space-y-3">
            <div className="flex gap-2">
              <Input value={embedCode} readOnly className="bg-neutral-800 border-neutral-700 font-mono text-xs" />
              <Button onClick={() => copyToClipboard(embedCode)}>
                <Code className="w-4 h-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="social" className="space-y-2">
            <Button onClick={() => shareToSocial('twitter')} className="w-full bg-sky-500 hover:bg-sky-600">
              Share on Twitter
            </Button>
            <Button onClick={() => shareToSocial('facebook')} className="w-full bg-blue-600 hover:bg-blue-700">
              Share on Facebook
            </Button>
            <Button onClick={() => shareToSocial('linkedin')} className="w-full bg-blue-700 hover:bg-blue-800">
              Share on LinkedIn
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}