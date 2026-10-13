import React from 'react';
import { MessageCircle } from 'lucide-react';

interface WhatsAppFloatingButtonProps {
  phoneNumber?: string;
  defaultMessage?: string;
}

export const WhatsAppFloatingButton: React.FC<WhatsAppFloatingButtonProps> = ({
  phoneNumber = '919846000000',
  defaultMessage = 'Hello Bright Mindz Academy, I would like to know more about your Spoken English courses.',
}) => {
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <aside aria-label="WhatsApp Support" className="fixed bottom-6 right-6 z-50 flex items-center group">
      <span className="hidden md:inline-block mr-3 px-3 py-1.5 bg-white text-slate-800 text-xs font-semibold rounded-full shadow-lg border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        Chat with us on WhatsApp
      </span>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Bright Mindz Academy on WhatsApp"
        className="w-14 h-14 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-full flex items-center justify-center shadow-xl hover:shadow-emerald-500/30 transition-all duration-200 ring-4 ring-emerald-500/20"
      >
        <MessageCircle className="w-7 h-7 fill-current" />
        <span className="sr-only">Chat with us on WhatsApp</span>
      </a>
    </aside>
  );
};
