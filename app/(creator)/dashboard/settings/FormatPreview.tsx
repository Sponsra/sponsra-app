import React from "react";
import { TierFormat } from "@/app/types/inventory";

interface FormatPreviewProps {
    format: TierFormat;
}

export const FormatPreview: React.FC<FormatPreviewProps> = ({ format }) => {
    if (format === "hero") {
        // Hero: Large image on top, Headline, Body
        return (
            <div className="w-full border-1 border-gray-200 border-round p-2 surface-50 flex flex-column gap-2 select-none" style={{ aspectRatio: '1.5/1', pointerEvents: 'none' }}>
                <div className="w-full surface-300 border-round" style={{ height: '50%' }}></div>
                <div className="flex flex-column gap-1">
                    <div className="w-8 h-1rem surface-400 border-round"></div>
                    <div className="w-full h-0.5rem surface-300 border-round"></div>
                    <div className="w-10 h-0.5rem surface-300 border-round"></div>
                </div>
            </div>
        );
    }

    if (format === "native") {
        // Native: Headline, Body (Text heavy, no image)
        return (
            <div className="w-full border-1 border-gray-200 border-round p-2 surface-50 flex flex-column gap-2 select-none" style={{ aspectRatio: '1.5/1', pointerEvents: 'none' }}>
                <div className="flex flex-column gap-2 mt-1">
                    <div className="w-full h-1rem surface-400 border-round"></div>
                    <div className="w-full h-0.5rem surface-300 border-round"></div>
                    <div className="w-11 h-0.5rem surface-300 border-round"></div>
                    <div className="w-9 h-0.5rem surface-300 border-round"></div>
                </div>
                <div className="mt-auto w-4 h-1rem surface-200 border-round"></div>
            </div>
        );
    }

    if (format === "link") {
        // Link: Headline/Link text only
        return (
            <div className="w-full border-1 border-gray-200 border-round p-2 surface-50 flex flex-column justify-content-center gap-2 select-none" style={{ aspectRatio: '1.5/1', pointerEvents: 'none' }}>
                <div className="flex gap-2 align-items-center">
                    <div className="w-1rem h-1rem surface-300 border-round"></div>
                    <div className="w-9 h-1rem surface-400 border-round"></div>
                </div>
                <div className="flex gap-2 align-items-center">
                    <div className="w-1rem h-1rem surface-300 border-round"></div>
                    <div className="w-7 h-1rem surface-400 border-round"></div>
                </div>
                <div className="flex gap-2 align-items-center">
                    <div className="w-1rem h-1rem surface-300 border-round"></div>
                    <div className="w-8 h-1rem surface-400 border-round"></div>
                </div>
            </div>
        );
    }

    return null;
};
