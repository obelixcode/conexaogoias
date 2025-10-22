'use client';

import { useEffect, useRef } from 'react';

/**
 * Hook para manipulação segura de DOM que evita erros de removeChild
 * Especialmente útil com Next.js 15.5.6 + Turbopack
 */
export function useSafeDOM() {
  const elementsRef = useRef<Set<HTMLElement>>(new Set());

  const safeCreateElement = (tag: string, attributes: Record<string, string> = {}): HTMLElement | null => {
    if (typeof window === 'undefined' || !document) return null;
    
    try {
      const element = document.createElement(tag);
      Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
      
      elementsRef.current.add(element);
      return element;
    } catch (error) {
      console.warn('Error creating element:', error);
      return null;
    }
  };

  const safeAppendChild = (parent: HTMLElement | null, child: HTMLElement | null): boolean => {
    if (!parent || !child) return false;
    
    try {
      parent.appendChild(child);
      return true;
    } catch (error) {
      console.warn('Error appending child:', error);
      return false;
    }
  };

  const safeRemoveElement = (element: HTMLElement | null): boolean => {
    if (!element) return false;
    
    try {
      // Usar remove() que é mais seguro que removeChild
      if (element.remove) {
        element.remove();
      } else if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
      
      elementsRef.current.delete(element);
      return true;
    } catch (error) {
      console.warn('Error removing element:', error);
      return false;
    }
  };

  const safeQuerySelector = (selector: string): NodeListOf<Element> | null => {
    if (typeof window === 'undefined' || !document) return null;
    
    try {
      return document.querySelectorAll(selector);
    } catch (error) {
      console.warn('Error querying selector:', error);
      return null;
    }
  };

  const safeRemoveElements = (selector: string): number => {
    const elements = safeQuerySelector(selector);
    if (!elements) return 0;
    
    let removed = 0;
    elements.forEach(element => {
      if (safeRemoveElement(element as HTMLElement)) {
        removed++;
      }
    });
    
    return removed;
  };

  // Cleanup automático de todos os elementos criados
  useEffect(() => {
    return () => {
      elementsRef.current.forEach(element => {
        safeRemoveElement(element);
      });
      elementsRef.current.clear();
    };
  }, []);

  return {
    safeCreateElement,
    safeAppendChild,
    safeRemoveElement,
    safeQuerySelector,
    safeRemoveElements,
  };
}
