import React, { useRef, useEffect, memo } from 'react';
import { generate, correction } from 'lean-qr';
import './QR.less';

interface PropsT {
  content: string;
}

export default memo(({ content }: PropsT) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      try {
        const code = generate(content, { minCorrectionLevel: correction.Q });
        code.toCanvas(canvasRef.current);
      } catch (e) {
        canvasRef.current.width = 1;
        canvasRef.current.height = 1;
        console.warn('Failed to render QR code', content);
      }
    }
  }, [canvasRef]);

  return <canvas className="qr-code" ref={canvasRef} />;
});
