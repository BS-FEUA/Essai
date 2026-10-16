'use client';

import { Separator } from '@/components/ui/separator';
import { MessageCircle, Camera } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto border-t-2 border-t-[var(--feua-gold)] bg-[#0f3d1f]/95 text-white/90 glass-surface">
      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* About */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <img src="/feua-logo.jpeg" alt="FEUA" className="h-8 w-8 object-contain drop-shadow-[0_0_8px_rgba(212,160,23,0.5)]" />
              <div>
                <h3 className="font-bold text-sm text-[var(--feua-gold)]">FEUA</h3>
                <p className="text-xs text-white/50">BS-Lokossa</p>
              </div>
            </div>
            <p className="text-xs text-white/60 leading-relaxed">
              Fédération des Étudiants de l’Université d’Abomey (UNSTIM) — Bureau Sectoriel de Lokossa.
              Unissant les étudiants pour un avenir meilleur au Bénin.
            </p>
            {/* Social media icons */}
            <div className="flex items-center gap-3 pt-1">
              <a href="#" className="p-1.5 rounded-full bg-white/10 hover:bg-[var(--feua-green)]/30 transition-colors" title="WhatsApp">
                <MessageCircle className="h-4 w-4 text-white/70" />
              </a>
              <a href="#" className="p-1.5 rounded-full bg-white/10 hover:bg-[var(--feua-green)]/30 transition-colors flex items-center justify-center w-7 h-7" title="Facebook">
                <svg className="h-3.5 w-3.5 text-white/70" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="#" className="p-1.5 rounded-full bg-white/10 hover:bg-[var(--feua-green)]/30 transition-colors" title="Instagram">
                <Camera className="h-4 w-4 text-white/70" />
              </a>
            </div>
          </div>

          {/* Links - hidden on mobile */}
          <div className="hidden lg:block space-y-2">
            <h4 className="font-semibold text-sm">Liens utiles</h4>
            <ul className="space-y-1 text-xs text-white/60">
              <li className="hover:text-[var(--feua-gold)] cursor-pointer transition-colors">
                À propos de FEUA
              </li>
              <li className="hover:text-[var(--feua-gold)] cursor-pointer transition-colors">
                Règlement intérieur
              </li>
              <li className="hover:text-[var(--feua-gold)] cursor-pointer transition-colors">
                Contact
              </li>
            </ul>
          </div>

          {/* Contact - hidden on mobile */}
          <div className="hidden lg:block space-y-2">
            <h4 className="font-semibold text-sm">Contact</h4>
            <ul className="space-y-1 text-xs text-white/60">
              <li className="hover:text-[var(--feua-gold)] transition-colors">Lokossa, Bénin</li>
              <li className="hover:text-[var(--feua-gold)] transition-colors">Monde étudiant</li>
              <li className="hover:text-[var(--feua-gold)] transition-colors">Université de Lokossa</li>
            </ul>
          </div>
        </div>

        <Separator className="my-4 bg-white/10" />

        <div className="text-center text-xs text-white/50">
          <p>© 2026 FEUA BS-Lokossa — Fédération des Étudiants de l’Université d’Abomey (UNSTIM)</p>
        </div>
      </div>
    </footer>
  );
}
