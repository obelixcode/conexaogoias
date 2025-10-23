import { Facebook, Twitter, Instagram, Youtube, MessageCircle } from 'lucide-react';
import { getCurrentYear } from '@/utils/dateUtils';
import { SiteSettings, DEFAULT_SETTINGS } from '@/types/settings';

interface FooterProps {
  footerPages?: Array<{ id: string; title: string; slug: string }>;
  settings?: SiteSettings;
}

export function Footer({ footerPages = [], settings }: FooterProps) {
  const currentYear = getCurrentYear();
  
  // Usar configurações padrão se settings não for fornecido
  const safeSettings = settings || DEFAULT_SETTINGS;

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main footer */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="lg:col-span-1">
            {safeSettings.footerLogoUrl ? (
              <img 
                src={safeSettings.footerLogoUrl} 
                alt={safeSettings.siteName}
                className="w-[100px] h-auto object-contain mb-4"
              />
            ) : (
              <div className="text-2xl font-bold mb-4">
                <span className="text-white">{safeSettings.siteName.toUpperCase()}</span>
                <span className="text-gray-400 text-lg">.com</span>
              </div>
            )}
            <p className="text-gray-300 text-sm mb-4">
              {safeSettings.siteDescription}
            </p>
            <div className="flex space-x-4">
              {safeSettings.socialMedia.facebook && (
                <a
                  href={safeSettings.socialMedia.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {safeSettings.socialMedia.twitter && (
                <a
                  href={safeSettings.socialMedia.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              {safeSettings.socialMedia.instagram && (
                <a
                  href={safeSettings.socialMedia.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {safeSettings.socialMedia.youtube && (
                <a
                  href={safeSettings.socialMedia.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube className="h-5 w-5" />
                </a>
              )}
              {safeSettings.socialMedia.whatsapp && (
                <a
                  href={safeSettings.socialMedia.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="text-gray-300 hover:text-white transition-colors" >
                  Últimas notícias
                </a>
              </li>
              <li>
                <a href="/categoria/politica" className="text-gray-300 hover:text-white transition-colors" >
                  Política
                </a>
              </li>
              <li>
                <a href="/categoria/cidades" className="text-gray-300 hover:text-white transition-colors" >
                  Cidades
                </a>
              </li>
              <li>
                <a href="/categoria/esportes" className="text-gray-300 hover:text-white transition-colors" >
                  Esportes
                </a>
              </li>
              <li>
                <a href="/categoria/economia" className="text-gray-300 hover:text-white transition-colors" >
                  Economia
                </a>
              </li>
              <li>
                <a href="/categoria/tecnologia" className="text-gray-300 hover:text-white transition-colors" >
                  Tecnologia
                </a>
              </li>
            </ul>
          </div>

          {/* Institutional */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Institucional</h3>
            <ul className="space-y-2 text-sm">
              {footerPages.length > 0 ? (
                footerPages.map((page) => (
                  <li key={`${page.id}-${Date.now()}`}>
                    <a 
                      href={`/pagina/${page.slug}`} 
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      {page.title}
                    </a>
                  </li>
                ))
              ) : (
                <li className="text-gray-400 text-xs">
                  Nenhuma página institucional encontrada
                </li>
              )}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contato</h3>
            <div className="space-y-2 text-sm text-gray-300">
              {safeSettings.address && (
                <p>
                  <strong>Endereço:</strong><br />
                  {safeSettings.address.split('\n').map((line, index) => (
                    <span key={index}>
                      {line}
                      {index < safeSettings.address.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </p>
              )}
              {(safeSettings.phone1 || safeSettings.phone2) && (
                <p>
                  <strong>Telefone:</strong><br />
                  {safeSettings.phone1 && <span>{safeSettings.phone1}</span>}
                  {safeSettings.phone1 && safeSettings.phone2 && <br />}
                  {safeSettings.phone2 && <span>{safeSettings.phone2}</span>}
                </p>
              )}
              <p>
                <strong>Email:</strong><br />
                {safeSettings.contactEmail}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-blue-900 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <div className="text-sm text-gray-300">
              Copyright © {safeSettings.foundingYear} - {currentYear} | {safeSettings.siteName} - Todos os direitos reservados.
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <a href="/rss" className="text-gray-300 hover:text-white transition-colors" >
                RSS Feed
              </a>
              <a href="/sitemap.xml" className="text-gray-300 hover:text-white transition-colors" >
                Mapa do Site
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
