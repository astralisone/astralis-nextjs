'use client';

import { Share2, Twitter, Facebook, Linkedin, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface SocialShareProps {
  title: string;
  url: string;
  description?: string;
}

export function SocialShare({ title, url, description }: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : url;
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedDescription = encodeURIComponent(description || title);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400');
  };

  return (
    <div className="glass-card border border-white/10 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Share2 className="w-5 h-5 text-primary-400" />
        <h3 className="text-lg font-semibold text-white">Share this post</h3>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('twitter')}
          className="glass-elevated border-white/20 hover:border-primary-400 hover:bg-primary-500/20"
        >
          <Twitter className="w-4 h-4 mr-2" />
          Twitter
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('facebook')}
          className="glass-elevated border-white/20 hover:border-primary-400 hover:bg-primary-500/20"
        >
          <Facebook className="w-4 h-4 mr-2" />
          Facebook
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('linkedin')}
          className="glass-elevated border-white/20 hover:border-primary-400 hover:bg-primary-500/20"
        >
          <Linkedin className="w-4 h-4 mr-2" />
          LinkedIn
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyLink}
          className="glass-elevated border-white/20 hover:border-primary-400 hover:bg-primary-500/20"
        >
          <motion.div
            key={copied ? 'check' : 'copy'}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="flex items-center"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2 text-green-400" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </>
            )}
          </motion.div>
        </Button>
      </div>
    </div>
  );
}
