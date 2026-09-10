import { useState, useCallback, useEffect, useRef } from 'react';

export interface UseWebNFCProps {
  onScanSuccess: (cardId: string) => void;
  onScanError?: (error: string) => void;
}

export function useWebNFC({ onScanSuccess, onScanError }: UseWebNFCProps) {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const ndefReaderRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Check Web NFC support in browser
    if ('NDEFReader' in window) {
      setIsSupported(true);
    } else {
      setIsSupported(false);
    }
  }, []);

  const startScanning = useCallback(async () => {
    if (!('NDEFReader' in window)) {
      const err = "NFC isn't supported on this device/browser.";
      setErrorMessage(err);
      if (onScanError) onScanError(err);
      return false;
    }

    try {
      setErrorMessage(null);
      // Abort any previous scanning session
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      // @ts-ignore Web NFC NDEFReader type
      const ndef = new window.NDEFReader();
      ndefReaderRef.current = ndef;

      await ndef.scan({ signal: abortControllerRef.current.signal });
      setIsScanning(true);

      ndef.addEventListener('readingerror', () => {
        const err = 'Failed to read NFC tag. Please try again.';
        setErrorMessage(err);
        if (onScanError) onScanError(err);
      });

      ndef.addEventListener('reading', ({ message, serialNumber }: any) => {
        let detectedId = serialNumber ? serialNumber.replace(/:/g, '').toUpperCase() : '';

        // Check NDEF plain text record
        if (message && message.records && message.records.length > 0) {
          for (const record of message.records) {
            if (record.recordType === 'text') {
              const textDecoder = new TextDecoder(record.encoding || 'utf-8');
              const decodedText = textDecoder.decode(record.data).trim();
              if (decodedText) {
                detectedId = decodedText;
                break;
              }
            }
          }
        }

        if (detectedId) {
          onScanSuccess(detectedId);
        } else if (serialNumber) {
          onScanSuccess(serialNumber);
        } else {
          onScanSuccess('UNKNOWN');
        }
      });

      return true;
    } catch (err: any) {
      console.error('[Web NFC Error]', err);
      let userMsg = 'Could not start NFC scanner.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        userMsg = 'NFC permission is required to scan cards.';
      } else if (err.name === 'NotSupportedError') {
        userMsg = "NFC isn't supported on this device.";
      } else if (err.name === 'AbortError') {
        userMsg = 'Scanning was cancelled.';
      }

      setErrorMessage(userMsg);
      setIsScanning(false);
      if (onScanError) onScanError(userMsg);
      return false;
    }
  }, [onScanSuccess, onScanError]);

  const stopScanning = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsScanning(false);
  }, []);

  return {
    isSupported,
    isScanning,
    errorMessage,
    startScanning,
    stopScanning
  };
}
