'use client';

import { useState, useEffect } from 'react';
import { Share2, MessageCircle, Twitter, Facebook, Linkedin, Mail, Link as LinkIcon, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NewsWithCategory } from '@/types';
import { getNewsUrl, getAbsoluteUrl } from '@/utils';

interface SocialShareButtonsProps {
  news: NewsWithCategory;
  className?: string;
}

export function SocialShareButtons({ news, className = '' }: SocialShareButtonsProps) {
  const newsTitle = news.title;
  const newsDescription = news.subtitle || news.title;
  const newsPath = getNewsUrl(news.slug);

  // Use current browser URL instead of environment variable
  const [baseUrl, setBaseUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [hasNativeShare, setHasNativeShare] = useState(false);

  useEffect(() => {
    // Get current browser URL when component mounts
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    } else {
      // Fallback to environment variable during SSR
      const envUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      setBaseUrl(envUrl.replace(/\/$/, ''));
    }
    
    // Check for native share support only on client side
    setHasNativeShare(typeof navigator !== 'undefined' && 'share' in navigator);
  }, []);

  // Construct news URL using current browser origin
  const newsUrl = baseUrl ? `${baseUrl}${newsPath}` : getAbsoluteUrl(newsPath);

  const shareData = {
    title: newsTitle,
    text: newsDescription,
    url: newsUrl,
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to copying URL
      handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(newsUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.log('Error copying link:', error);
    }
  };

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${newsTitle} - ${newsUrl}`)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(newsTitle)}&url=${encodeURIComponent(newsUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(newsUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(newsUrl)}`,
    email: `mailto:?subject=${encodeURIComponent(newsTitle)}&body=${encodeURIComponent(`${newsDescription}\n\n${newsUrl}`)}`,
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {/* Native share button (mobile) */}
      {hasNativeShare && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleNativeShare}
          className="flex items-center space-x-1 sm:space-x-2"
        >
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">Compartilhar</span>
        </Button>
      )}

      {/* WhatsApp */}
      <Button
        variant="outline"
        size="sm"
        asChild
        className="flex items-center space-x-1 sm:space-x-2 text-green-600 hover:text-green-700 hover:bg-green-50"
      >
        <a
          href={shareLinks.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Compartilhar no WhatsApp"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="hidden sm:inline">WhatsApp</span>
        </a>
      </Button>

      {/* Twitter */}
      <Button
        variant="outline"
        size="sm"
        asChild
        className="flex items-center space-x-1 sm:space-x-2 text-blue-400 hover:text-blue-500 hover:bg-blue-50"
      >
        <a
          href={shareLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Compartilhar no Twitter"
        >
          <Twitter className="h-4 w-4" />
          <span className="hidden sm:inline">Twitter</span>
        </a>
      </Button>

      {/* Facebook */}
      <Button
        variant="outline"
        size="sm"
        asChild
        className="flex items-center space-x-1 sm:space-x-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
      >
        <a
          href={shareLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Compartilhar no Facebook"
        >
          <Facebook className="h-4 w-4" />
          <span className="hidden sm:inline">Facebook</span>
        </a>
      </Button>

      {/* LinkedIn */}
      <Button
        variant="outline"
        size="sm"
        asChild
        className="flex items-center space-x-1 sm:space-x-2 text-blue-700 hover:text-blue-800 hover:bg-blue-50"
      >
        <a
          href={shareLinks.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Compartilhar no LinkedIn"
        >
          <Linkedin className="h-4 w-4" />
          <span className="hidden sm:inline">LinkedIn</span>
        </a>
      </Button>

      {/* Email */}
      <Button
        variant="outline"
        size="sm"
        asChild
        className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50"
      >
        <a
          href={shareLinks.email}
          aria-label="Compartilhar por email"
        >
          <Mail className="h-4 w-4" />
          <span className="hidden sm:inline">Email</span>
        </a>
      </Button>

      {/* Copy link */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyLink}
        className={`flex items-center space-x-1 sm:space-x-2 ${
          copied 
            ? 'text-green-600 hover:text-green-700 hover:bg-green-50' 
            : 'text-gray-600 hover:text-gray-700 hover:bg-gray-50'
        }`}
        aria-label="Copiar link"
      >
        {copied ? <Check className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
        <span className="hidden sm:inline">
          {copied ? 'Copiado!' : 'Copiar link'}
        </span>
      </Button>
    </div>
  );
}
