import React from 'react';
import QRCode from 'qrcode';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  className?: string;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ 
  value, 
  size = 200, 
  className = "" 
}) => {
  const [qrCodeUrl, setQrCodeUrl] = React.useState<string>('');

  React.useEffect(() => {
    const generateQR = async () => {
      try {
        const url = await QRCode.toDataURL(value, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        setQrCodeUrl(url);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    if (value) {
      generateQR();
    }
  }, [value, size]);

  if (!qrCodeUrl) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
        style={{ width: size + 32, height: size + 32 }}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div 
        className="border-2 border-gray-200 rounded-lg p-4 bg-white"
        style={{ width: size + 32, height: size + 32 }}
      >
        <img 
          src={qrCodeUrl}
          alt="QR Code"
          width={size}
          height={size}
          className="w-full h-full"
        />
      </div>
    </div>
  );
};