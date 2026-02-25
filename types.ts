export interface Quote {
  id: string;
  text: string;
  author?: string;
}

export interface AIReflection {
  originalQuote: string;
  reflection: string;
  advice: string;
}

export interface ImageAnalysis {
  description: string;
  suggestedQuote: string;
  spiritualAdvice: string;
}