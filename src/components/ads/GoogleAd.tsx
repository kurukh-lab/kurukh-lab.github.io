import { useEffect, type CSSProperties } from 'react';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export interface GoogleAdProps {
  adSlot?: string;
  adFormat?: string;
  className?: string;
  style?: CSSProperties;
}

const GoogleAd = ({
  adSlot = '1234567890',
  adFormat = 'auto',
  className = '',
  style = {},
}: GoogleAdProps) => {
  useEffect(() => {
    try {
      if (window.adsbygoogle) {
        window.adsbygoogle.push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  return (
    <div className={`google-ad-container ${className}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  );
};

export interface AdSidebarProps {
  className?: string;
}

export const AdSidebar = ({ className = '' }: AdSidebarProps) => (
  <div className={`ad-sidebar space-y-6 ${className}`}>
    <div className="ad-section">
      <h3 className="text-sm font-medium text-gray-600 mb-2">Advertisement</h3>
      <GoogleAd
        adSlot="1111111111"
        adFormat="rectangle"
        className="border border-gray-200 rounded-lg"
        style={{ width: '300px', height: '250px', backgroundColor: '#f8f9fa' }}
      />
    </div>
    <div className="ad-section">
      <GoogleAd
        adSlot="2222222222"
        adFormat="rectangle"
        className="border border-gray-200 rounded-lg"
        style={{ width: '300px', height: '250px', backgroundColor: '#f8f9fa' }}
      />
    </div>
    <div className="ad-section">
      <GoogleAd
        adSlot="3333333333"
        adFormat="rectangle"
        className="border border-gray-200 rounded-lg"
        style={{ width: '300px', height: '250px', backgroundColor: '#f8f9fa' }}
      />
    </div>
    <div className="ad-section">
      <GoogleAd
        adSlot="4444444444"
        adFormat="auto"
        className="border border-gray-200 rounded-lg"
        style={{ width: '300px', minHeight: '100px', backgroundColor: '#f8f9fa' }}
      />
    </div>
  </div>
);

export default GoogleAd;
