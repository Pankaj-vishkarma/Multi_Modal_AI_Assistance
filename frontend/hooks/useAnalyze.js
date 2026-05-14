import { useState, useCallback } from 'react';
import { analyzeMedia } from '../lib/api';
import { showSuccessToast, showErrorToast } from '../hooks/use-toast';

export const useAnalyze = () => {
    const [result, setResult] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState(null);

    const analyze = useCallback(async (file) => {
        if (!file || !file.url) return null;

        setError(null);
        setIsAnalyzing(true);
        setResult(null);

        try {
            let fileType = "unknown";

            if (file.type?.startsWith("image/")) {
                fileType = "image";
            } else if (file.type?.startsWith("video/")) {
                fileType = "video";
            } else if (file.type?.startsWith("audio/")) {
                fileType = "audio";
            } else if (file.type === "application/pdf") {
                fileType = "document";
            }

            if (fileType === "unknown") {
                const message = "Unsupported file type";
                setError(message);
                showErrorToast(message);
                return null;
            }

            const response = await analyzeMedia(file.url, fileType);

            // IMPORTANT FIX: normalize response
            let finalResult = null;

            if (fileType === "document") {
                finalResult = response?.aiAnalysis || response?.result || "No analysis";
            } else {
                finalResult = response?.result || response?.data || response;
            }

            // Handle backend error response
            if (response?.success === false) {
                throw new Error(response.message || "Analysis failed");
            }

            setResult(finalResult);

            showSuccessToast("Analysis completed");

            return finalResult;

        } catch (err) {
            const message =
                err?.message ||
                err?.response?.data?.message ||
                "Analysis failed";

            setError(message);
            showErrorToast(message);
            console.error("Analyze error:", err);

            return null;
        } finally {
            setIsAnalyzing(false);
        }
    }, []);

    const reset = useCallback(() => {
        setResult(null);
        setError(null);
        setIsAnalyzing(false);
    }, []);

    return {
        analyze,
        result,
        isAnalyzing,
        error,
        reset,
    };
};