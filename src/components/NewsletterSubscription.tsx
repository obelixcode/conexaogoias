'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, Mail, AlertCircle } from 'lucide-react';
import { newsletterService } from '@/lib/services/NewsletterService';

interface NewsletterSubscriptionProps {
  className?: string;
}

export function NewsletterSubscription({ className = '' }: NewsletterSubscriptionProps) {
  const [email, setEmail] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToLGPD, setAgreedToLGPD] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) return;
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Por favor, insira um e-mail válido.');
      return;
    }
    
    setShowConfirmation(true);
  };

  const handleConfirmSubscription = async () => {
    if (!agreedToTerms || !agreedToLGPD) {
      alert('Você deve concordar com os termos e a LGPD para continuar.');
      return;
    }

    setIsLoading(true);
    
    try {
      // Obter informações do navegador
      const userAgent = navigator.userAgent;
      const ipAddress = await getClientIP();
      
      // Fazer a inscrição real
      await newsletterService.subscribe({
        email,
        ipAddress,
        userAgent,
        source: 'website'
      });
      
      setShowConfirmation(false);
      setShowSnackbar(true);
      setEmail('');
      setAgreedToTerms(false);
      setAgreedToLGPD(false);
      
      // Esconder snackbar após 3 segundos
      setTimeout(() => setShowSnackbar(false), 3000);
      
    } catch (error: unknown) {
      console.error('Erro ao inscrever-se na newsletter:', error);
      alert((error as Error).message || 'Erro ao processar inscrição. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para obter IP do cliente (simplificada)
  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  };

  const handleCancelSubscription = () => {
    setShowConfirmation(false);
    setAgreedToTerms(false);
    setAgreedToLGPD(false);
  };

  return (
    <>
      {/* Newsletter Form */}
      <div className={`bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white rounded-xl p-8 text-center shadow-xl border border-blue-700/20 ${className}`}>
        {/* Header with Icon */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            Receba nossas notícias
          </h3>
          <p className="text-blue-100 text-base leading-relaxed max-w-sm mx-auto">
            Fique por dentro das principais notícias de Goiás e receba atualizações exclusivas
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-blue-300 group-focus-within:text-blue-200 transition-colors" />
            </div>
            <Input
              type="email"
              placeholder="Digite seu melhor e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 text-base border-2 border-white/20 bg-white/95 focus:bg-white focus:border-blue-300 focus:ring-4 focus:ring-blue-300/20 transition-all duration-200 placeholder:text-gray-500"
              required
            />
          </div>
          
          <Button 
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            disabled={!email.trim()}
          >
            <span className="flex items-center justify-center space-x-2">
              <span>Inscrever-se</span>
              <Check className="h-4 w-4" />
            </span>
          </Button>
        </form>

        {/* Trust Indicators */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <p className="text-xs text-blue-200 flex items-center justify-center space-x-1">
            <Check className="h-3 w-3" />
            <span>Sem spam • Cancele quando quiser • Dados protegidos</span>
          </p>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              Confirmação de Inscrição
            </DialogTitle>
            <DialogDescription>
              Antes de confirmar sua inscrição, leia e aceite os termos abaixo:
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                />
                <label htmlFor="terms" className="text-sm text-gray-700 leading-relaxed">
                  Concordo em receber e-mails da nossa comunicação com notícias, 
                  atualizações e conteúdo relevante sobre Goiás.
                </label>
              </div>
              
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="lgpd"
                  checked={agreedToLGPD}
                  onCheckedChange={(checked) => setAgreedToLGPD(checked as boolean)}
                />
                <label htmlFor="lgpd" className="text-sm text-gray-700 leading-relaxed">
                  Concordo com a{' '}
                  <a href="/pagina/politica-privacidade" target="_blank" className="text-blue-600 hover:underline">
                    Política de Privacidade
                  </a>{' '}
                  e os{' '}
                  <a href="/pagina/termos-uso" target="_blank" className="text-blue-600 hover:underline">
                    Termos de Uso
                  </a>{' '}
                  da LGPD.
                </label>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancelSubscription}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmSubscription}
              disabled={!agreedToTerms || !agreedToLGPD || isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? 'Processando...' : 'Confirmar Inscrição'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Snackbar */}
      {showSnackbar && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-2">
          <div className="bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]">
            <Check className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-medium">Inscrição realizada com sucesso!</p>
              <p className="text-sm text-green-100">
                Você receberá nossas notícias em breve.
              </p>
            </div>
            <button
              onClick={() => setShowSnackbar(false)}
              className="ml-auto text-green-200 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}
