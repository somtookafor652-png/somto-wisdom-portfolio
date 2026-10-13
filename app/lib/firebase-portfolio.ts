import { getDocument, isFirebaseConfigured } from './firebase';
import { portfolioData, type PortfolioData } from './portfolio-data';

const DEFAULT_PORTFOLIO_DOCUMENT = 'site/portfolio';

function getPortfolioDocumentPath() {
  return process.env.FIREBASE_PORTFOLIO_DOCUMENT ?? DEFAULT_PORTFOLIO_DOCUMENT;
}

export async function fetchPortfolioData(): Promise<PortfolioData> {
  if (!isFirebaseConfigured()) {
    return portfolioData;
  }

  try {
    const data = await getDocument<PortfolioData>(getPortfolioDocumentPath());
    return data ?? portfolioData;
  } catch (error) {
    console.error('Firebase Error:', error);
    return portfolioData;
  }
}
